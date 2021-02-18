#/bin/bash
# Generates an LDBC SNB dataset of a given scale, and fragments its according to a given strategy.

command_exists () {
    type "$1" &> /dev/null ;
}

# Check flags
scale="0.1"
force=false
fragconfig="templates/fragmenter-config-subject.json"
while getopts os:f: flag
do
    case "${flag}" in
		o) force=true;;
        s) scale=${OPTARG};;
		f) fragconfig=${OPTARG};;
		\?) echo "Usage: prepare.sh"
    		echo "Optional flags"
			echo "  -o       If existing files should be overwritten"
    		echo "  -s       The SNB scale factor (default: 0.1) (possible: 0.1, 1, 3, 10, 30, 100, 300, 1000)"
			echo "  -f       Path to the fragmentation strategy (default: fragmenter-config-subject.json)"
			exit 1
			;;
    esac
done

# Generate SNB dataset
if [ -d "$(pwd)/out-snb/" ] && [ "$force" = false ]; then
	echo -e "\033[1m\033[34mSNB dataset generator\033[0m: Skipped (/out-snb already exists, remove to regenerate)"
else
	echo -e "\033[1m\033[34mSNB dataset generator\033[0m: Started"
	mkdir -p "$(pwd)/out-snb/"
	cat templates/params.ini | sed "s/SCALE/$scale/" > params.ini
	docker run --rm \
		--mount type=bind,source="$(pwd)/out-snb/",target="/opt/ldbc_snb_datagen/out" \
		--mount type=bind,source="$(pwd)/params.ini",target="/opt/ldbc_snb_datagen/params.ini" \
		-e HADOOP_CLIENT_OPTS="-Xmx4G" rubensworks/ldbc_snb_datagen:latest
	rm params.ini
	echo -e "\033[1m\033[34mSNB dataset generator\033[0m: Done"
fi

# Fragment SNB dataset
if [ -d "$(pwd)/out-fragments/" ] && [ "$force" = false ]; then
	echo -e "\033[1m\033[34mSNB dataset fragmenter\033[0m: Skipped (/out-fragments already exists, remove to regenerate)"
else
	# Install fragmenter if needed
	if ! command_exists rdf-dataset-fragmenter; then
		echo -e "\033[1m\033[34mSNB dataset fragmenter\033[0m: Installing"
		npm install -g rdf-dataset-fragmenter
	fi
	
	echo -e "\033[1m\033[34mSNB dataset fragmenter\033[0m: Started"
	rdf-dataset-fragmenter $fragconfig
	echo -e "\033[1m\033[34mSNB dataset fragmenter\033[0m: Done"
fi
