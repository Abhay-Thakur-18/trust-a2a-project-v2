from nacl.signing import SigningKey, VerifyKey
import base64

def generate_keys():
    signing_key = SigningKey.generate()
    verify_key = signing_key.verify_key

    return (
        base64.b64encode(signing_key.encode()).decode(),
        base64.b64encode(verify_key.encode()).decode()
    )


def sign_message(private_key_b64, message):
    private_key = SigningKey(base64.b64decode(private_key_b64))
    signed = private_key.sign(message.encode())
    return base64.b64encode(signed.signature).decode()


def verify_message(public_key_b64, message, signature_b64):
    try:
        verify_key = VerifyKey(base64.b64decode(public_key_b64))
        verify_key.verify(message.encode(), base64.b64decode(signature_b64))
        return True
    except:
        return False