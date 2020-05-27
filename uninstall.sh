#!/bin/bash
# set -e
# set -x

echo
echo "Uninstalling ..."
npm uninstall 
rm -r ./node_modules/ && echo "...removed ./node_modules/"
rm -v ./package-lock.json

tc="$( find . -name tonclient.node )"
if [ -n "${tc}" ]
    then
        echo -e "Tonclient binary:\v ${tc}"
        rm -v ${tc}
    else 
        echo 'Tonclient binary not found'
fi
echo "... Uninstalled."

# echo
# echo "Installing..."
# npm install
# echo 'Search Tonclient binary:'
# find . -name tonclient.node
# echo "Installed."

