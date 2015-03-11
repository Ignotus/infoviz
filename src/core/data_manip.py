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
    
    def is_inside(place, pcinfo):
	if place['housenumber'] == 0:
	    return place['streetname'].strip().lower() == pcinfo['streetname'].strip().lower()
	else:
	    return place['streetname'].strip().lower() == pcinfo['streetname'].strip().lower() \
		  and place['housenumber'] >= pcinfo['minnumber'] \
		  and place['housenumber'] <= pcinfo['maxnumber'] \
		  and (pcinfo['numberorder'] == 'mixed' \
			or (pcinfo['numberorder'] == 'odd'  and place['housenumber']%2 == 1) \
			or (pcinfo['numberorder'] == 'even' and place['housenumber']%2 == 0))
    
    result = []
    nf = 0
    f = 0
    for place in function_info:
	found = False
	if not len(place['streetname']) == 0:
	    for pcinfo in postcode_info:
		if is_inside(place, pcinfo):
		    place['postcode'] = pcinfo['postcode']
		    result += [place]
		    found = True
		    break
	    if not found:
		print "street: " + place['streetname'].strip() + " " + str(place['housenumber']) + " not found for object: " + str(place['id'])
	if not found:
	    nf += 1
	else:
	    f += 1
		
    print "Not Found: " + str(nf) + " Found: " + str(f);
    return result