import * as Joi from 'joi';

export const addWishlistSchema = Joi.object({
  outfitId: Joi.string().trim().required(),
});

export interface AddWishlistDto {
  outfitId: string;
}
