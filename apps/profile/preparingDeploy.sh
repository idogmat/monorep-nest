#!/bin/bash
sed -i -e "s/REGISTRY_HOSTNAME/$1/g"  ./apps/profile/deployment.yaml
sed -i -e "s/PROJECT/$2/g" ./apps/profile/deployment.yaml
sed -i -e "s/TAG_VERSION/$3/g" ./apps/profile/deployment.yaml
sed -i -e "s/DEPLOYMENT_NAME/$4/g" ./apps/profile/deployment.yaml
sed -i -e "s/PORT_CONTAINER/$5/g" ./apps/profile/deployment.yaml
sed -i -e "s/NAMESPACE/$6/g" ./apps/profile/deployment.yaml
