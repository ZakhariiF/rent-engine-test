import React, { useEffect, useState } from 'react';
import axios from 'axios';
import xml2js from 'xml2js';
import { Container, Typography, Grid, Chip, Card, CardContent, TextField } from '@mui/material';

const App = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const proxyUrl = 'http://localhost:8080/';
        const jsonResponse = await axios.get(proxyUrl + 'https://www.rentengine.io/api/getListingsInView?neLat=55.98296328587119&neLng=-54.54163846501635&swLat=5.1917120305937345&swLng=-142.45547380176595');
        const jsonListings = jsonResponse.data;

        const zillowResponse = await axios.get(proxyUrl + 'https://dcepycifzliabhkgcitm.supabase.co/storage/v1/object/public/listing-feeds/zillow/rentengineListings.xml');
        const zumperResponse = await axios.get(proxyUrl + 'https://dcepycifzliabhkgcitm.supabase.co/storage/v1/object/public/listing-feeds/zumper/rentengineListings.xml');

        const zillowData = await xml2js.parseStringPromise(zillowResponse.data, { explicitArray: false });
        const zumperData = await xml2js.parseStringPromise(zumperResponse.data, { explicitArray: false });

        const zillowListings = zillowData.hotPadsItems.Listing.map(listing => listing.$['id']) || [];

        const zumperListings = zumperData.properties?.property?.map(listing => listing.details['provider-listingid']) || [];

        console.log('Flattened Zillow Listings:', zillowListings);
        console.log('Zumper Listings:', zumperListings);

        const combinedListings = jsonListings.map(listing => ({
          id: listing.id.toString(),
          inZillow: zillowListings.includes(listing.id.toString()),
          inZumper: zumperListings.includes(listing.id.toString()),
        }));

        setListings(combinedListings);
        setFilteredListings(combinedListings);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFilteredListings(
        listings.filter(listing => listing.id.includes(search))
    );
  }, [search, listings]);

  return (
      <Container style={{ paddingBottom: '20px' }}>
        <Typography variant="h4" gutterBottom style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>
          Listings IDs with Status
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderRadius: '5px'}}>
          <TextField
              label="Search by ID"
              variant="outlined"
              style={{ width: '50%' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? <p>Loading...</p> : (
            <Grid container spacing={3}>
              {filteredListings.map((listing, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card style={{ backgroundColor: '#f5f3f0', color: 'black' }}>
                      <CardContent style={{ textAlign: 'center' }}>
                        <Typography variant="h6">ID: {listing.id}</Typography>
                        <div style={{ marginTop: '10px' }}>
                          <Typography variant="body2" component="p">Zillow:</Typography>
                          <Chip label={listing.inZillow ? "No errors" : "Error"} color={listing.inZillow ? "success" : "error"} />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <Typography variant="body2" component="p">Zumper:</Typography>
                          <Chip label={listing.inZumper ? "No errors" : "Error"} color={listing.inZumper ? "success" : "error"} />
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
              ))}
            </Grid>
        )}
      </Container>
  );
};

export default App;
