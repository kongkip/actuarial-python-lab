import pandas as pd
import numpy as np
import statsmodels.api as sm
import patsy
import joblib
import os
from core.base import ActuarialModel
from core.pricing.validators import validate_exposure

class PoissonFrequencyEngine(ActuarialModel):
    """
    Industrial-grade Poisson GLM for Insurance Frequency Modeling.
    Implements log-linear multiplicative pricing.
    """
    
    def __init__(self, formula: str = "observed_claims ~ age_bin"):
        self.formula = formula
        self.model = None
        self.params = None
        self.is_fitted = False

    def _preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        """Applies consistent binning as defined in research."""
        df = df.copy()
        bins = [17, 25, 60, 100]
        df['age_bin'] = pd.cut(df['driver_age'], bins=bins, labels=['Young', 'Middle', 'Senior'])
        return df

    def fit(self, data: pd.DataFrame):
        """Fits the Poisson GLM and extracts the coefficients."""
        df = self._preprocess(data)
        validate_exposure(df['exposure'])
        
        offset = np.log(df['exposure'])
        
        # Fit the model using Statsmodels
        self.model = sm.formula.glm(
            formula=self.formula,
            data=df,
            offset=offset,
            family=sm.families.Poisson(link=sm.families.links.Log())
        ).fit()
        
        # CRITICAL FIX: Extract coefficients as a pure Python dictionary
        self.params = self.model.params.to_dict()
        self.is_fitted = True
        return self

    def predict(self, data: pd.DataFrame) -> np.ndarray:
        """Predicts the expected annual frequency using pure math."""
        if not self.is_fitted:
            raise RuntimeError("Model must be fitted before prediction.")
        
        df = self._preprocess(data)
        
        # If we are in training memory and have the heavy model, use it
        if self.model is not None:
            return self.model.predict(df, offset=np.zeros(len(df)))
        
        # PRODUCTION INFERENCE: Reconstruct from the lightweight params dictionary
        # 1. Extract the Right Hand Side of the formula (e.g., 'age_bin')
        rhs = self.formula.split('~')[1]
        
        # 2. Build the design matrix dynamically
        X = patsy.dmatrix(rhs, df, return_type='dataframe')
        
        # 3. Calculate the log-link dot product (Linear Predictor)
        log_lambda = sum(X[col] * self.params[col] for col in X.columns)
        
        # 4. Exponentiate to get the raw frequency
        return np.exp(log_lambda).values

    def save(self, path: str, metadata: dict = None):
        """Saves ONLY the coefficients, making it immune to unpickling errors."""
        if not self.is_fitted:
            raise ValueError("No model parameters to save.")
        
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        # Notice we are NO LONGER saving `self.model`
        payload = {
            "params": self.params, 
            "formula": self.formula,
            "metadata": metadata or {}
        }
        
        joblib.dump(payload, path)
        print(f"[*] Lightweight Model successfully serialized to: {path}")

    @classmethod
    def load(cls, path: str):
        """Loads the lightweight parameter state."""
        if not os.path.exists(path):
            raise FileNotFoundError(f"No model found at {path}")
            
        state = joblib.load(path)
        
        instance = cls(formula=state["formula"])
        instance.params = state["params"] # Pure python dictionary
        instance.metadata = state.get("metadata", {})
        instance.model = None # Explicitly None for production safety
        instance.is_fitted = True
        
        return instance



def apply_credibility(raw_rates, prior_mean, exposures, k):
    """
    Applies Bühlmann credibility weighting to raw modeled rates.
    Formula: Z = Exposure / (Exposure + K)
    """
    # Ensure inputs are numpy arrays to allow vectorized math
    raw_rates = np.asarray(raw_rates)
    exposures = np.asarray(exposures)
    
    # Vectorized calculation: returns an array of Z-factors
    z_factors = exposures / (exposures + k)
    
    # Vectorized calculation: returns an array of smoothed rates
    smoothed_rates = z_factors * raw_rates + (1.0 - z_factors) * prior_mean
    
    return smoothed_rates, z_factors


# ==========================================
# TRAINING PIPELINE ENTRY POINT
# ==========================================
if __name__ == "__main__":
    print("[+] Initializing Actuarial Training Pipeline...")
    
    # 1. Simulate Portfolio
    np.random.seed(42)
    n_policies = 10000
    data = pd.DataFrame({
        'exposure': np.random.uniform(0.02, 1.0, n_policies),
        'driver_age': np.random.randint(18, 90, n_policies),
    })

    age_mult = { 'Young': 1.8, 'Middle': 1.0, 'Senior': 1.2 }
    temp_bins = [17, 25, 60, 100]
    data['age_bin'] = pd.cut(data['driver_age'], bins=temp_bins, labels=['Young', 'Middle', 'Senior'])
    data['true_lambda'] = 0.05 * data['age_bin'].map(age_mult).astype(float)
    data['observed_claims'] = np.random.poisson(data['true_lambda'] * data['exposure'])

    # --- ACTUARIAL CONSTANTS ---
    portfolio_mean = data['observed_claims'].sum() / data['exposure'].sum()
    K_CONSTANT = 350.0 # Tuning parameter: Higher K = More Smoothing

    # 2. Train Engine
    engine = PoissonFrequencyEngine()
    engine.fit(data)
    
    # 3. COMPARISON ANALYSIS: THE SMOOTHING EFFECT
    # We compare two 'Young' drivers (Age 20). 
    # One has full exposure, one has very low exposure.
    
    scenarios = pd.DataFrame({
        'driver_age': [20, 20],
        'exposure': [1.0, 0.05], # 1 year vs ~18 days
        'label': ['Full Year Policy', 'Short-Term Policy']
    })

    raw_predictions = engine.predict(scenarios)
    smoothed_rates, z_factors = apply_credibility(
        raw_predictions, portfolio_mean, scenarios['exposure'].values, k=K_CONSTANT
    )

    print("\n" + "="*60)
    print(f"{'SCENARIO':<20} | {'RAW GLM':<10} | {'Z-FACTOR':<10} | {'SMOOTHED':<10}")
    print("-" * 60)

    for i in range(len(scenarios)):
        row = scenarios.iloc[i]
        print(f"{row['label']:<20} | {raw_predictions[i]:>9.2%} | {z_factors[i]:>9.4f} | {smoothed_rates[i]:>9.2%}")

    print("="*60)
    print(f"Portfolio Mean (Prior): {portfolio_mean:.2%}")
    print(f"Smoothing Effect: The Short-Term policy was pulled {abs(smoothed_rates[1]-raw_predictions[1]):.2%} toward the mean.")

    # 4. Save for Production
    MODEL_OUTPUT_PATH = "services/models/poisson_v1.joblib"
    engine.save(MODEL_OUTPUT_PATH, metadata={"portfolio_mean": portfolio_mean, "k_constant": K_CONSTANT})

    print("[+] Pipeline Complete.")