import os

# Accessing the SAVE_PATH environment variable
save_path = os.environ.get('SAVE_PATH')

if save_path:
    print(f"Directory: {save_path}")
else:
    print("Directory: None")
