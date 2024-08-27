import { useEffect, useState } from "react";
import "./ExplorePage.css";
import { getVendorNames, getVendorByName } from "../service/vendors";
import {
  Box,
  Autocomplete,
  AutocompleteProps,
  Image,
  Group,
  RangeSlider,
  Text,
} from "@mantine/core";
import VendorCard from "../components/VendorCard";

export default function ExplorePage() {
  const [vendors, setVendors] = useState([]); //vendor names to autopopulate search bar
  const [formState, setFormState] = useState(""); //search bar
  const [searchResult, setSearchResult] = useState(null); //result from search bar
  const [allVendors, setAllVendors] = useState([]); //all vendors when page loads
  const [filteredVendors, setFilteredVendors] = useState([]); //filtered vendors
  const [priceFilter, setPriceFilter] = useState([0, 500]);
  const [capFilter, setCapFilter] = useState([0, 500]);
  const [filterApplied, setFilterApplied] = useState(false); // track if filter is applied

  // retrieve available vendors
  async function getVendors() {
    try {
      const vendorNames = await getVendorNames();
      const vendorNamelist = vendorNames.data.map((vendor) => vendor.Name);
      console.log("vendorNamelist", vendorNamelist);
      setVendors(vendorNamelist); //setVendor state
    } catch {
      console.error("Error fetching vendors");
    }
  }

  useEffect(() => {
    getVendors();
    setSearchResult(null); //null so that all vendors show when page loads
  }, []);

  // retrieve all vendors
  async function fetchAllVendors() {
    try {
      const vendorPromises = vendors.map(async (vendor) => {
        return await getVendorByName(vendor);
      });
      const allVendors = await Promise.all(vendorPromises);
      console.log("fetchAllVendors", allVendors);
      setAllVendors(allVendors as never[]);
    } catch {
      console.error("Error fetching all vendors");
    }
  }
  useEffect(() => {
    fetchAllVendors();
  }, [vendors]);

  // const renderAutocompleteOption: AutocompleteProps["renderOption"] = ({
  //   value,
  // }) => {
  //   const eachVendor = allVendors.find((v) => v.Name === value);
  //   return (
  //     <Group c="blue" gap="sm">
  //       {eachVendor && eachVendor.image_url && (
  //         <Image src={eachVendor.image_url} size={5} radius="xl" />
  //       )}
  //       <div>
  //         <Text c="blue" size="sm">
  //           {value}
  //         </Text>
  //         <Text c="blue" style={{ color: "black" }} size="xs" opacity={0.5}>
  //           {eachVendor ? eachVendor.Location : ""}
  //         </Text>
  //       </div>
  //     </Group>
  //   );
  // };

  //handle submit for search bar
  async function handleSubmit(evt: React.FormEvent) {
    try {
      evt.preventDefault();
      const result = await getVendorByName(formState);
      console.log("getVendorByName result", result);
      setSearchResult(result);
    } catch (e) {
      console.error(e);
    }
  }

  //when filter changes, filter vendors
  async function submitFilters() {
    setFilterApplied(true);
    const filteredVendors = allVendors.filter((vendor) => {
      return (
        (vendor.MinCap as number) >= capFilter[0] &&
        (vendor.MaxCap as number) <= capFilter[1] &&
        (vendor.MinPrice as number) >= priceFilter[0] &&
        (vendor.MaxPrice as number) <= priceFilter[1]
      );
    });
    console.log("filteredVendors", filteredVendors);
    setFilteredVendors(filteredVendors);
  }

  return (
    <>
      <div className="explorePage">
        <form className="searchBar" autoComplete="off" onSubmit={handleSubmit}>
          <Autocomplete
            placeholder="Enter a venue name"
            // renderOption={renderAutocompleteOption}
            data={vendors}
            onChange={setFormState}
          />
          <button
            className="button"
            type="submit"
            style={{ fontSize: "16px", padding: "2px" }}
          >
            Go
          </button>
        </form>

        {searchResult ? null : (
          <Box className="filters">
            <Text size="m" fw={700} mb={-10} align="left" ml={10}>
              Capacity
            </Text>
            <RangeSlider
              defaultValue={[0, 500]}
              min={0}
              max={500}
              step={50}
              label={(value) => `${value} pax`}
              onChange={(value) => setCapFilter(value)}
              color="#84A59D"
              m={6}
              styles={{
                bar: {
                  padding: "0",
                  height: "6px",
                },
                track: {
                  padding: "0",
                  height: "6px",
                },
              }}
            />
            <Text size="sm" mb={10}>
              {capFilter[0]} to {capFilter[1]} pax
            </Text>
            <Text size="m" fw={700} mb={-10} align="left" ml={10}>
              Price per pax
            </Text>
            <RangeSlider
              defaultValue={[0, 500]}
              min={0}
              max={500}
              step={50}
              label={(value) => `$${value}`}
              onChange={(value) => setPriceFilter(value)}
              color="#84A59D"
              m={6}
              styles={{
                bar: {
                  padding: "0",
                  height: "6px",
                },
                track: {
                  padding: "0",
                  height: "6px",
                },
              }}
            />
            <Text size="sm" mb={10}>
              ${priceFilter[0]} to ${priceFilter[1]}
            </Text>
            <button
              className="button"
              onClick={submitFilters}
              mt={10}
              style={{ fontSize: "16px", padding: "0" }}
            >
              Filter
            </button>
          </Box>
        )}

        <Box className="vendorcardgrid">
          {searchResult ? (
            <VendorCard vendor={searchResult} />
          ) : filterApplied && filteredVendors.length === 0 ? (
            <Text>No results found</Text>
          ) : (
            (filteredVendors.length > 0 ? filteredVendors : allVendors).map(
              (vendor, index) => <VendorCard key={index} vendor={vendor} />
            )
          )}
        </Box>
      </div>
    </>
  );
}
