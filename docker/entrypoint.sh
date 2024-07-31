#!/bin/sh

ROOT_DIR=/usr/share/nginx/html

# Replace env vars in JavaScript files
api_url=$(echo "$VITE_API_URL" | sed 's/\//\\\//g')
for file in $ROOT_DIR/assets/*.js* $ROOT_DIR/index.html; do
  echo "Processing $file ..."

  sed -i "s/VITE_API_URL_value/$api_url/g" $file 
  sed -i 's|VITE_TOGGLE_value|'${VITE_TOGGLE}'|g' $file
  sed -i 's|VITE_AUGUSTIN_COVER_value|'${VITE_TOGGLE}'|g' $file
  sed -i 's|VITE_AGB_URL_value|'${VITE_AGB_URL}'|g' $file
  sed -i 's|VITE_VENDOR_NOT_FOUND_HELP_URL_value|'${VITE_VENDOR_NOT_FOUND_HELP_URL}'|g' $file
  sed -i 's|VITE_MAINTAINANCE_HELP_URL_value|'${VITE_MAINTAINANCE_HELP_URL}'|g' $file
  sed -i 's|VITE_FRONTEND_URL_value|'${VITE_FRONTEND_URL}'|g' $file
  sed -i 's|VITE_VENDOR_EMAIL_POSTFIX_value|'${VITE_VENDOR_EMAIL_POSTFIX}'|g' $file

done
