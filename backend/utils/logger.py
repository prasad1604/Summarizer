import logging
import sys

def setup_logger(name=None, level="INFO"):
    logger = logging.getLogger(name)
    logger.setLevel(level)
    if not logger.hasHandlers():
        ch = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        logger.addHandler(ch)
    return logger
