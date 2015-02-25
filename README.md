# infoviz-project

## Environment configuring

Please be sure that following packages have been installed into your system:

* python
* python-virtualenv
* git

UNIX system is preferred for the project, but everything can be easily configured
for the [Windows system](http://www.tylerbutler.com/2012/05/how-to-install-python-pip-and-virtualenv-on-windows-with-powershell/).

After cloning the project run following commands in your project folder:

```
mkvirtualenv --no-site-packages --distribute infoviz-project
pip install -r requirements.txt
```

In the case if your system cannot find mkvirtualenv do this command first:

```
source /usr/bin/virtualenvwrapper.sh
```

## Run the project

```
cd src
python app.py
```

Open http://127.0.0.1:5000 to see a result
