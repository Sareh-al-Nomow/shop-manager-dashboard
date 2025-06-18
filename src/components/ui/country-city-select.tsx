import React, { useEffect, useState } from "react";
import { locationService } from "@/services";
import { Country, City } from "@/services/locationService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CountryCitySelectProps {
  onCountryChange?: (country: Country | null) => void;
  onCityChange?: (city: City | null) => void;
  selectedCountryId?: number;
  selectedCityId?: number;
  countryLabel?: string;
  cityLabel?: string;
  className?: string;
}

export function CountryCitySelect({
  onCountryChange,
  onCityChange,
  selectedCountryId,
  selectedCityId,
  countryLabel = "Country",
  cityLabel = "City",
  className,
}: CountryCitySelectProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const data = await locationService.getCountries();
        setCountries(data);
        setError(null);

        // If a country ID is provided, select that country
        if (selectedCountryId) {
          const country = data.find(c => c.id === selectedCountryId) || null;
          setSelectedCountry(country);

          // If the country has cities, set them
          if (country && country.Cities) {
            setCities(country.Cities);

            // If a city ID is provided, select that city
            if (selectedCityId) {
              const city = country.Cities.find(c => c.id === selectedCityId) || null;
              setSelectedCity(city);
            }
          }
        }
      } catch (err) {
        setError("Failed to fetch countries");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [selectedCountryId, selectedCityId]);

  // Handle country change
  const handleCountryChange = async (countryId: string) => {
    const id = parseInt(countryId);
    const country = countries.find(c => c.id === id) || null;
    setSelectedCountry(country);

    if (country) {
      // If the country has cities in the response, use them
      if (country.Cities && country.Cities.length > 0) {
        setCities(country.Cities);
      } else {
        // Otherwise fetch cities for the selected country
        try {
          const citiesData = await locationService.getCitiesByCountry(id);
          setCities(citiesData);
        } catch (err) {
          console.error("Failed to fetch cities:", err);
          setCities([]);
        }
      }

      // Reset selected city when country changes
      setSelectedCity(null);
      if (onCityChange) onCityChange(null);
    } else {
      setCities([]);
      setSelectedCity(null);
      if (onCityChange) onCityChange(null);
    }

    if (onCountryChange) onCountryChange(country);
  };

  // Handle city change
  const handleCityChange = (cityId: string) => {
    const id = parseInt(cityId);
    const city = cities.find(c => c.id === id) || null;
    setSelectedCity(city);
    if (onCityChange) onCityChange(city);
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="country-select">{countryLabel}</Label>
          <Select
            disabled={loading}
            value={selectedCountry ? String(selectedCountry.id) : ""}
            onValueChange={handleCountryChange}
          >
            <SelectTrigger id="country-select" className="mt-1">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={String(country.id)}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <div>
          <Label htmlFor="city-select">{cityLabel}</Label>
          <Select
            disabled={!selectedCountry || cities.length === 0}
            value={selectedCity ? String(selectedCity.id) : ""}
            onValueChange={handleCityChange}
          >
            <SelectTrigger id="city-select" className="mt-1">
              <SelectValue placeholder={selectedCountry ? "Select a city" : "Select a country first"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={String(city.id)}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}