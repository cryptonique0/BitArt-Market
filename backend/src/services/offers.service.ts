import { supabase } from '../config/supabase';

class OffersServiceClass {
  async createOffer(nftId: string, buyerAddress: string, amount: number, expiresAt?: string, currency: string = 'STX') {
    const { data, error } = await supabase
      .from('offers')
      .insert({ nft_id: nftId, buyer_address: buyerAddress, amount, currency, expires_at: expiresAt })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async listNFTOffers(nftId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('nft_id', nftId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async listUserOffers(address: string) {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .or(`buyer_address.eq.${address},seller_address.eq.${address}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async acceptOffer(offerId: string, sellerAddress: string) {
    const { data: offer } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single();
    if (!offer) throw new Error('Offer not found');
    if (offer.status !== 'open') throw new Error('Offer not open');

    const { data, error } = await supabase
      .from('offers')
      .update({ status: 'accepted', seller_address: offer.seller_address || sellerAddress })
      .eq('id', offerId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async rejectOffer(offerId: string, sellerAddress: string) {
    const { data: offer } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single();
    if (!offer) throw new Error('Offer not found');
    if (offer.status !== 'open') throw new Error('Offer not open');

    const { data, error } = await supabase
      .from('offers')
      .update({ status: 'rejected', seller_address: offer.seller_address || sellerAddress })
      .eq('id', offerId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async counterOffer(offerId: string, sellerAddress: string, amount: number, expiresAt?: string) {
    const { data: offer } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single();
    if (!offer) throw new Error('Offer not found');
    if (offer.status !== 'open') throw new Error('Offer not open');

    const { data: newOffer, error: insertError } = await supabase
      .from('offers')
      .insert({
        nft_id: offer.nft_id,
        buyer_address: offer.buyer_address,
        seller_address: sellerAddress,
        amount,
        currency: offer.currency,
        expires_at: expiresAt,
        parent_offer_id: offer.id,
      })
      .select('*')
      .single();
    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('offers')
      .update({ status: 'countered' })
      .eq('id', offer.id);
    if (updateError) throw updateError;

    return newOffer;
  }

  async expireOpenOffers(): Promise<number> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('offers')
      .update({ status: 'expired' })
      .eq('status', 'open')
      .lt('expires_at', now)
      .select('id');
    if (error) throw error;
    return (data || []).length;
  }
}

export const OffersService = new OffersServiceClass();