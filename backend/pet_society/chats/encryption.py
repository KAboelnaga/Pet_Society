from cryptography.fernet import Fernet
import os
from django.conf import settings
import base64

def get_encryption_key():
    """
    Get or generate encryption key for chat messages
    """
    key = getattr(settings, 'ENCRYPTION_KEY', None)
    if not key:
        # Generate a new key for development (not recommended for production)
        key = Fernet.generate_key().decode()
        print(f"Generated new encryption key: {key}")
        print("Please set ENCRYPTION_KEY environment variable for production")
    return key.encode() if isinstance(key, str) else key

def encrypt_message(message):
    """
    Encrypt a chat message
    """
    if not message:
        return message
    
    try:
        key = get_encryption_key()
        fernet = Fernet(key)
        encrypted_message = fernet.encrypt(message.encode())
        return base64.b64encode(encrypted_message).decode()
    except Exception as e:
        print(f"Encryption error: {e}")
        return None

def decrypt_message(encrypted_message):
    """
    Decrypt a chat message
    """
    if not encrypted_message:
        return encrypted_message
    
    try:
        key = get_encryption_key()
        fernet = Fernet(key)
        decoded_message = base64.b64decode(encrypted_message.encode())
        decrypted_message = fernet.decrypt(decoded_message)
        return decrypted_message.decode()
    except Exception as e:
        print(f"Decryption error: {e}")
        return None

def get_message_content(message_obj):
    """
    Get the content of a message, decrypting if necessary
    """
    if message_obj.is_encrypted:
        decrypted = decrypt_message(message_obj.encrypted_body)
        return decrypted if decrypted else '[Encrypted Message]'
    return message_obj.encrypted_body