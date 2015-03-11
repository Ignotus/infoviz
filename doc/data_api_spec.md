## /data/regions

Shows all regions with following fields:

- region id (mandatory)
- border (mandatory)
- leisure score (mandatory)
- a bunch of other scores (mandatory). All of them will be like "type_score" key value

Example:

http://127.0.0.1:5000/data/regions

## /data/regions/< region_id >

Shows statatistic for the current region

Example:

http://127.0.0.1:5000/data/regions/1063

## /data/objects/types

Show all available types that we can process now (use it instead of hard coded types in the interface to make our system scalable).

Example:

http://127.0.0.1:5000/data/objects/types

## /data/objects/all

Returns all available objects in Amsterdam:

- borders (not mandatory) - can consist from several polygons
- coordinate (mandatory) - [x, y]
- name
- region
- type
- subtype

Example:

http://127.0.0.1:5000/data/objects/all

## /data/objects/by_region/< region_id >

Returns all available objects in the region

Example:

http://127.0.0.1:5000/data/objects/by_region/1063

## /objects/by_type/< object_type >

Returns all available objects with a required type

Example:

http://127.0.0.1:5000/data/objects/by_type/green

## /data/objects/by_region/< region_id >/by_type/< object_type >

Returns all available objects with a required type in the region

Example:

http://127.0.0.1:5000/data/objects/by_region/1063/by_type/green
