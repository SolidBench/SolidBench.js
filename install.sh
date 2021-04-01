#/bin/bash
# Install the required npm packages

if [ ! -d "$(pwd)/node_modules/" ]; then
    echo -e "\033[1m\033[34mInstaller\033[0m: Installing required npm packages"
    npm install
    echo -e "\033[1m\033[34mInstaller\033[0m: Done"
fi
