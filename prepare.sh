#/bin/bash
# Generates an LDBC SNB dataset of a given scale, and fragments its according to a given strategy.

# Check flags
scale="0.1"
force=false
enhanceconfig="templates/enhancer-config-dummy.json"
fragconfig="templates/fragmenter-config-subject.json"
fragenhanceconfig="templates/fragmenter-auxiliary-config-subject.json"
while getopts os:f: flag
do
    case "${flag}" in
		o) force=true;;
        s) scale=${OPTARG};;
        e) enhanceconfig=${OPTARG};;
        f) fragconfig=${OPTARG};;
        g) fragenhanceconfig=${OPTARG};;
		\?) echo "Usage: prepare.sh"
    		echo "Optional flags"
			echo "  -o       If existing files should be overwritten"
    		echo "  -s       The SNB scale factor (default: 0.1) (possible: 0.1, 1, 3, 10, 30, 100, 300, 1000)"
            echo "  -e       Path to the enhancement config (default: enhancer-config-dummy.json)"
            echo "  -f       Path to the fragmentation strategy (default: fragmenter-config-subject.json)"
            echo "  -g       Path to the enhancement's fragmentation strategy (default: fragmenter-auxiliary-config-subject.json)"
			exit 1
			;;
    esac
done

# Ensure required packages are installed
$(dirname "${BASH_SOURCE[0]}")/install.sh

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

# Enhance SNB dataset
if [ -d "$(pwd)/out-enhanced/" ] && [ "$force" = false ]; then
	echo -e "\033[1m\033[34mSNB dataset enhancer\033[0m: Skipped (/out-enhanced already exists, remove to regenerate)"
else
	echo -e "\033[1m\033[34mSNB dataset enhancer\033[0m: Started"
    mkdir $(pwd)/out-enhanced
	npx ldbc-snb-enhancer $enhanceconfig
	echo -e "\033[1m\033[34mSNB dataset enhancer\033[0m: Done"
fi

# Fragment SNB dataset
if [ -d "$(pwd)/out-fragments/" ] && [ "$force" = false ]; then
	echo -e "\033[1m\033[34mSNB dataset fragmenter\033[0m: Skipped (/out-fragments already exists, remove to regenerate)"
else	
    # Initial fragmentation
	echo -e "\033[1m\033[34mSNB dataset fragmenter\033[0m: Started initial pass"
	npx rdf-dataset-fragmenter $fragconfig
	echo -e "\033[1m\033[34mSNB dataset fragmenter\033[0m: Done with initial pass"
    
    # Auxiliary fragmentation
	echo -e "\033[1m\033[34mSNB dataset fragmenter\033[0m: Started auxiliary pass"
	npx rdf-dataset-fragmenter $fragenhanceconfig
	echo -e "\033[1m\033[34mSNB dataset fragmenter\033[0m: Done with auxiliary pass"
fi
