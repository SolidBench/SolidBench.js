#/bin/bash
# Serves the fragmented dataset via an HTTP server

command_exists () {
    type "$1" &> /dev/null ;
}

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

# Install fragmenter if needed
if ! command_exists community-solid-server; then
	echo -e "\033[1m\033[34mSolid Community Server\033[0m: Installing"
	npm install -g @solid/community-server@0.6.0
fi

echo -e "\033[1m\033[34mSolid Community Server\033[0m: Started"
community-solid-server  -f out-fragments/http/localhost_3000/ -c $config
