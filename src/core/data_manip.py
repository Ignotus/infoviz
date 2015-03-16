import numpy as np
import matplotlib.path as mplPath

#
# Complexity about O(nmk^2), where n - number of regions, m - number
# of places. k - average number of coordinates in region borders.
#
def add_postcode_for_places(region_info, places_collection):
    def is_inside(place, region):
        bbPath = mplPath.Path(np.array(region['border']))
        return bbPath.contains_point(place['coordinate'])
    
    result = []

    for place in places_collection:
        for region in region_info:
            if is_inside(place, region):
                place['region'] = region['region']
                result += [place]
                break

    return result
  
def map_street_to_postcode(function_info, postcode_info):
    
    def is_inside(place, pcinfo, consider_n):
	if consider_n:
	    return place['streetname'] == pcinfo['streetname'] \
		  and place['housenumber'] >= pcinfo['minnumber'] \
		  and place['housenumber'] <= pcinfo['maxnumber'] \
		  and (pcinfo['numberorder'] == 'mixed' \
			or (pcinfo['numberorder'] == 'odd'  and place['housenumber']%2 == 1) \
			or (pcinfo['numberorder'] == 'even' and place['housenumber']%2 == 0))
	else:
	    return place['streetname'] == pcinfo['streetname']
    
    result = list()
    n_h = list()
    empty_street = list()
    street_not_found = set()
    nf = 0
    f = 0
    for place in function_info:
	found = False
	if not len(place['streetname']) == 0:
	    if place['streetname'] == 'ellermansstraat':
		place['streetname'] = 'ellermanstraat'
	    for pcinfo in postcode_info:
		if is_inside(place, pcinfo, True):
		    place['region'] = pcinfo['postcode']
		    place['coordiantes'] = pcinfo['coordinates']
		    result.append(place)
		    found = True
		    f += 1
		    break
	    if not found:
		n_h.append(place)
	else:
	    empty_street.append(place['id'])
	    nf += 1

    for place in n_h:
	found = False
	for pcinfo in postcode_info:
	    if is_inside(place, pcinfo, False):
		place['region'] = pcinfo['postcode']
		place['coordiantes'] = pcinfo['coordinates']
		result.append(place)
		found = True
		f += 1
		break

        if not found:
	    # print "street: " + place['streetname'] + " not found for object: " + str(place['id'])
	    street_not_found.add(place['streetname'])
            nf += 1

    # DEBUG
    # print "Empty Streets Shop ID's: " + str(empty_street)
    # print "Streets not found: " + str(street_not_found)
    # print "Not Found: " + str(nf) + " Found: " + str(f);
    return result#, empty_street, street_not_found

def map_function_to_category(function_info, category_mapping):
    result = list()
    for place in function_info:
    	if place['functioncode'] in category_mapping:
	    place['type'] = category_mapping[place['functioncode']]
	else:
	    place['type'] = 'non-leisure'	
	result.append(place)
    return result

def create_building_function_dataset(function_info, postcode_info, category_mapping):
    pc_mapping = map_street_to_postcode(function_info, postcode_info)
    return map_function_to_category(pc_mapping, category_mapping)
    #return map_function_to_category(function_info, category_mapping)

    
