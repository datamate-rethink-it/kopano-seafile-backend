# Seafile Plugin for Kopano
The **Seafile Plugin for Kopano** integrates [Seafile](https://seafile.com) as a file backend in [Kopano](https://kopano.com) and extends the groupware with File Sharing functions. The Seafile backend is an extension of the Kopano Files plugin and allows direct access of all your Seafile data within kopano.

# Installation

The Installation of the Seafile backend is done in three steps. First, it is necessary to install the Files plugin from Kopano. This is desribed in the [WebApp Files Manual](https://documentation.kopano.io/webapp_files_manual/). Then this plugin must be cloned or downloaded and unpacked into the ```/usr/share/kopano-webapp/plugins/``` directory. The folder of this plugin has to be renamed to *filesbackendSeafile*. After that the Seafile backend can be activated in the Kopano settings area.

# Prerequisites

The **Seafile Plugin for Kopano** requires a Kopano installation with activated Files plugin and a Seafile Server. This plugin has been tested with Seafile Community and Seafile Professional in version 6.3.x and 7.0. [WebDAV has to be enabled](https://manual.seafile.com/extension/webdav.html) on the Seafile server. 

Seafile and Kopano can be installed on different servers.

Seafile limits the number of API calls. To avoid [errors](https://forum.seafile.com/t/seafile-response-429-detail-request-was-throttled-expected-available-in-x-second/4093/5), we recommend the following settings in the seahub_settings.py:
```
REST_FRAMEWORK = {
  'DEFAULT_THROTTLE_RATES': {
    'ping': '600/minute',
    'anon': '30/minute',
    'user': '10000/minute',
  },
}
```

