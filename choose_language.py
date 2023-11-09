import sys
import json

def choose_language(language_code):
    # Supported languages
    supported_languages = ["english", "czech", "polish"]

    # Check if the chosen language is supported
    if language_code not in supported_languages:
        raise ValueError(f"Unsupported language. Choose from: {', '.join(supported_languages)}")

    # Write the language to a file
    with open('language_setting.json', 'w') as file:
        json.dump({'language': language_code}, file)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python choose_language.py [language]")
        sys.exit(1)

    language = sys.argv[1].lower()
    try:
        choose_language(language)
        print(f"Language set to {language}")
    except ValueError as e:
        print(e)
        sys.exit(1)
