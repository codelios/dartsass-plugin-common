# Unit testing

If your unit tests fail with the error that `/usr/local/bin/sass not found` you can
make them proceed locally by setting `LOCALSASS` environment variable in your platform as appropriate.


Eg on Linux ( ubuntu )

`export LOCALSASS=/opt/code/src/github.com/codelios/dartsass-plugin-common/node_modules/.bin/sass && yarn testonly`

This helps proceed with the test cases. 
