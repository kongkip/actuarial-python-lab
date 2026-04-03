import numpy as np

def validate_exposure(v):
    """Ensures exposure is within a realistic 0 to 1 year range."""
    if np.any((v <= 0) | (v > 1.0)):
        raise ValueError("Exposure (v) must be in the interval (0, 1].")

def validate_positive_lambda(lambdas):
    """Ensures the Poisson intensity is strictly positive."""
    if np.any(lambdas <= 0):
        raise ValueError("Predicted frequency lambda must be positive.")