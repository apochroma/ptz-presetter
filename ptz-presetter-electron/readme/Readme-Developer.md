#Anleitung
Wenn man das Repository zum ersten mal herunterlädt (cloned), müssen folgende Schritte unternommen werden um weieter daran arbeiten zu können.

## Install Modules
`cd ptz-presetter-electron`

`npm install`

Das erstellt erst mal den Ordner `node_modules` und dort drin sind alle Module die es für Electron App braucht.

## Lokalen Build erstellen
Um die App zu testen:
`npm start`

Die App kann man mit dem Helper Script build.sh erstellen.

## Troubleshooting
![](images/reame00.png)
Das deutet darauf hin, dass die Module noch nicht installiert wurden.

`npm install`
`npm start`
![](images/reame01.png)