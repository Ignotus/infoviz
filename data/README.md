# Data Sources Description

* [Amsterdam Open Geodata](http://maps.amsterdam.nl/open_geodata/) ([Term of Use](http://maps.amsterdam.nl/open_geodata/TermsOfUse.html))
  - Public playgrounds
  - City parks & public greens
  - Non-residential building functions

* [Postal Codes Mapped To Polygons](https://www.google.com/fusiontables/DataSource?docid=1mjJ3ixFpeQKQ6vBybfKXTqQlzyV67Ycj3ckpN6QA&pli=1#rows:id=1)

* [Streetnames and Housenumbers to Postcode] (http://www.postcodedata.nl)

* [Residents per Postcode] (http://statline.cbs.nl/StatWeb/publication/?VW=T&DM=SLNL&PA=81310NED&LA=NL)

The Workflow will be as follows:
 - get the polygon information and 4 digit postcode from the Polygon-dataset
 - match the streetnames in the non-residential building dataset against the postcode data with the streetnames and housenumbers to extract the 4-digit postcode per building. Map the category-keys to our leasure categories (maybe we should keep the original category descriptions(not the codes) for a detail view per category(not sure about that. could be in an in between dataset))
 - match the latitude/longitude for the playgrounds with the polygon region to define the four digit postcode for the data (define a good measure for the size, keep it the same measure as with the park dataset) 
 - calculate the overlap of the polygons of the parks and the postcodes to define how much of a park falls within a postcode. (find a good measure for the size (m^2?), should be the same measure as in the playground dataset), generate a dataset from that with the count as catergory: 'park' and the size per postcode in a csv
 - extract the postcode and resitential-buildings count from the residents per postcode dataset
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

now we have 5 datasets:
  
polygon dataset (per postcode):
-----------------
polygon, postcode
-----------------

non-residential-buildings dataset (per building):
-------------------------------------------------
category, postcode, functie
-------------------------------------------------

playground dataset (per playground):
-------------------------------------
category, postcode, type, sizemeasure
-------------------------------------

green area dataset (per parkpart in postcode):
----------------------------------------------
category, postcode, type, sizemeasure
----------------------------------------------

residential-buildings (per postcode, category is non-leisure):
-------------------------------------
residential-buildings-count, postcode
-------------------------------------

the three datasets with non-residential-buildings, playgrounds and green areas are inbetween datasets,
from these we further abstract:
-------------------------------
category, postcode, total-count
-------------------------------

then we concatenate all the datasets to a dataset that contains:
----------------------------------------------------------------
category1-count, category2-count, ... , postcode, total-count(inculding non-leisure), polygon
----------------------------------------------------------------

this should give us roughly 80 rows with counts for each category, a postcode and the polygon belonging to the postcode.
----------------------------------------------------------------
for each category in each postcode.
