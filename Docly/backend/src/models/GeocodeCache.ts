import mongoose, {
  type HydratedDocument,
  type Model,
  model,
  models,
  Schema,
} from 'mongoose';

/** A single structured place returned by the geocoding provider. */
export interface GeocodePlace {
  displayName: string;
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  country?: string;
  boundingbox?: number[];
}

/** Plain data shape of a cached geocoding query result. */
export interface IGeocodeCache {
  queryKey: string; // sanitized, lowercased query used as lookup key
  query: string; // original query for debugging
  results: GeocodePlace[];
  createdAt: Date;
  expiresAt: Date;
}

export type GeocodeCacheDoc = HydratedDocument<IGeocodeCache>;
export type GeocodeCacheModel = Model<IGeocodeCache, {}, {}>;

const geocodeCacheSchema = new Schema<IGeocodeCache, GeocodeCacheModel, {}>(
  {
    queryKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    query: { type: String, required: true },
    results: {
      type: [
        {
          displayName: { type: String, required: true },
          lat: { type: Number, required: true },
          lon: { type: Number, required: true },
          city: { type: String },
          state: { type: String },
          country: { type: String },
          boundingbox: { type: [Number] },
        },
      ],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: false },
);

geocodeCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const GeocodeCache: GeocodeCacheModel =
  (models.GeocodeCache as GeocodeCacheModel | undefined) ??
  model<IGeocodeCache, GeocodeCacheModel>('GeocodeCache', geocodeCacheSchema);