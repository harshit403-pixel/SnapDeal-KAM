import { getSellerOverview } from "./seller.service.js";

export function getSeller(req, res) {
  res.json(getSellerOverview());
}
