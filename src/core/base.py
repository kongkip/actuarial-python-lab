from abc import ABC, abstractmethod
import pandas as pd

class ActuarialModel(ABC):
    """
    Abstract Base Class for all risk models in the lab.
    Ensures a consistent interface for fitting and inference.
    """
    
    @abstractmethod
    def fit(self, X: pd.DataFrame, y: pd.Series, **kwargs):
        """Fit the model to historical data."""
        pass

    @abstractmethod
    def predict(self, X: pd.DataFrame) -> pd.Series:
        """Generate technical predictions (e.g., expected frequency)."""
        pass

    @abstractmethod
    def save(self, path: str):
        """Serialize model parameters for production."""
        pass