#!/bin/bash

mongoimport --db coop --collection users --file users.json --journal
mongoimport --db coop --collection families --file families.json --journal
mongoimport --db coop --collection settings --file settings.json --journal
mongoimport --db coop --collection transactions --file transactions.json --journal