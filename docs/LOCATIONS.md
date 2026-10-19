# County and town dropdowns

The request form reads `client/src/data/kenya-locations.json`. Each entry contains a county name and a list of towns or areas. All 47 counties are included; towns and neighbourhoods are a curated, non-exhaustive selection. These are location choices for the demonstration, not an official administrative boundary dataset.

The county structure can be cross-checked against the [KNBS county census reports](https://www.knbs.or.ke/2019-kenya-population-and-housing-census-reports/). County statistics and urban-centre publications are useful references when expanding the town lists.

To add coverage, add a town or area to the appropriate county's `towns` array. Keep names unique within each county. Cross-boundary towns may legitimately appear under more than one county. The frontend alphabetises the town options.

`LocationFields.jsx` displays the dependent dropdowns. Changing the county clears the town, and the town dropdown stays disabled until a county is selected. Frontend validation checks that the chosen town belongs to that county. The API continues validating location text lengths and stores the selected names in the existing columns, so no migration is needed and older requests remain readable.

Users should choose their nearest listed town or area and specify the exact street or landmark in the required location-details field.
