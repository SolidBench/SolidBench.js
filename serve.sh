#/bin/bash
# Serves the fragmented dataset via an HTTP server

# Check flags
port="3000"
config="templates/server-config.json"
while getopts p:c: flag
do
    case "${flag}" in
		o) force=true;;
		o) config=${OPTARG};;
		\?) echo "Usage: serve.sh"
    		echo "Optional flags"
			echo "  -p       The HTTP port to run on (default: 3000)"
			echo "  -c       Path to the server config (default: server-config.json)"
			exit 1
			;;
    esac
done

# Ensure required packages are installed
$(dirname "${BASH_SOURCE[0]}")/install.sh

echo -e "\033[1m\033[34mSolid Community Server\033[0m: Started"
npx community-solid-server -f out-fragments/http/localhost_3000/ -c $config
