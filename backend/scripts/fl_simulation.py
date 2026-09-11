"""Small federated learning simulation (Tier 3) without requiring Flower at import time.

If `flwr` and `numpy` are installed (`pip install -e ".[fl]"`), runs a tiny FedAvg
round on synthetic binary classification data across 3 clients and prints loss curve.
Otherwise prints an honest skip message.
"""

from __future__ import annotations


def run_numpy_fedavg() -> list[float]:
    import numpy as np

    rng = np.random.default_rng(42)
    n_clients = 3
    dim = 8
    rounds = 8
    lr = 0.25

    # Synthetic local datasets
    clients = []
    for _ in range(n_clients):
        x = rng.normal(size=(40, dim))
        w_true = rng.normal(size=(dim,))
        y = (x @ w_true + 0.1 * rng.normal(size=40) > 0).astype(float)
        clients.append((x, y))

    global_w = np.zeros(dim)
    losses: list[float] = []

    def sigmoid(z):
        return 1 / (1 + np.exp(-np.clip(z, -20, 20)))

    for _ in range(rounds):
        local_weights = []
        local_losses = []
        for x, y in clients:
            w = global_w.copy()
            for _step in range(5):
                pred = sigmoid(x @ w)
                grad = x.T @ (pred - y) / len(y)
                w -= lr * grad
            pred = sigmoid(x @ w)
            eps = 1e-7
            loss = float(-np.mean(y * np.log(pred + eps) + (1 - y) * np.log(1 - pred + eps)))
            local_weights.append(w)
            local_losses.append(loss)
        global_w = np.mean(np.stack(local_weights), axis=0)
        losses.append(float(np.mean(local_losses)))
    return losses


def main() -> None:
    try:
        import numpy  # noqa: F401
    except ImportError:
        print(
            "FL simulation skipped: install optional deps with "
            '`pip install -e ".[fl]"` (numpy; flwr optional for future expansion).'
        )
        print("This is Tier 3 — small synthetic proof, not production federated learning.")
        return

    losses = run_numpy_fedavg()
    print("SwasthyaSetu Tier-3 FL simulation (numpy FedAvg, 3 synthetic clients)")
    print("Loss curve:", ", ".join(f"{v:.4f}" for v in losses))
    if losses[-1] < losses[0]:
        print("OK: mean local loss decreased across rounds.")
    else:
        print("WARN: loss did not decrease; inspect hyperparameters.")
    print("Honesty note: patient data never left synthetic clients; only averaged weights move.")


if __name__ == "__main__":
    main()
