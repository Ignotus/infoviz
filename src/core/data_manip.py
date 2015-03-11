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