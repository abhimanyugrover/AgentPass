"""
AgentPass — RSA key management and JWT signing.

On import the module ensures a 2048-bit RSA key pair exists under
``issuer-service/keys/``.  If the files are missing they are generated
automatically.
"""

import base64
from pathlib import Path

import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

# ── Key paths ────────────────────────────────────────────────────────────────

_KEYS_DIR: Path = Path(__file__).resolve().parent / "keys"
_PRIVATE_KEY_PATH: Path = _KEYS_DIR / "private_key.pem"
_PUBLIC_KEY_PATH: Path = _KEYS_DIR / "public_key.pem"


def _ensure_keys() -> None:
    """Generate and persist an RSA-2048 key pair if it doesn't exist yet."""
    if _PRIVATE_KEY_PATH.exists() and _PUBLIC_KEY_PATH.exists():
        return

    _KEYS_DIR.mkdir(parents=True, exist_ok=True)

    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    # Write private key
    _PRIVATE_KEY_PATH.write_bytes(
        private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
    )

    # Write public key
    _PUBLIC_KEY_PATH.write_bytes(
        private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
    )


# Run once on import
_ensure_keys()


# ── Helpers ──────────────────────────────────────────────────────────────────

def _load_private_key() -> bytes:
    return _PRIVATE_KEY_PATH.read_bytes()


def _load_public_key() -> bytes:
    return _PUBLIC_KEY_PATH.read_bytes()


# ── Public API ───────────────────────────────────────────────────────────────

def sign_token(claims: dict) -> str:
    """Sign *claims* as a JWT (RS256) and return the compact token string."""
    return jwt.encode(claims, _load_private_key(), algorithm="RS256")


def get_public_key_pem() -> bytes:
    """Return the raw PEM bytes of the public key (for local verification)."""
    return _load_public_key()


def get_public_key_jwk() -> dict:
    """Return the public key formatted as a JSON Web Key (JWK) dict.

    The dict contains ``kty``, ``use``, ``alg``, ``n``, and ``e`` fields
    suitable for inclusion in a JWKS ``keys`` array.
    """
    from cryptography.hazmat.primitives.serialization import load_pem_public_key

    pub = load_pem_public_key(_load_public_key())
    pub_numbers = pub.public_numbers()  # type: ignore[union-attr]

    def _int_to_base64url(value: int) -> str:
        byte_length = (value.bit_length() + 7) // 8
        raw = value.to_bytes(byte_length, byteorder="big")
        return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")

    return {
        "kty": "RSA",
        "use": "sig",
        "alg": "RS256",
        "n": _int_to_base64url(pub_numbers.n),
        "e": _int_to_base64url(pub_numbers.e),
    }
