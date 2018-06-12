import subprocess

_EXEC = "ffmpeg"


def transcode(data: bytes, codec: str, target_format: str) -> bytes:
    result = subprocess.run([_EXEC, "-i", "pipe:0", "-acodec", codec, "-f", target_format, "pipe:1"], input=data, stdout=subprocess.PIPE, check=True)
    return result.stdout
