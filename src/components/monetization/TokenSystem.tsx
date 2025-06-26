import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Coins, Gift, Crown, Clock } from 'lucide-react';
import { format, differenceInHours } from 'date-fns';
import toast from 'react-hot-toast';

export function TokenSystem() {
  const { profile, updateProfile } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  useEffect(() => {
    checkDailyTokenClaim();
  }, [profile]);

  const checkDailyTokenClaim = () => {
    if (!profile?.last_daily_token_claim) {
      setCanClaimDaily(true);
      return;
    }

    const lastClaim = new Date(profile.last_daily_token_claim);
    const now = new Date();
    const hoursSinceLastClaim = differenceInHours(now, lastClaim);
    
    setCanClaimDaily(hoursSinceLastClaim >= 24);
  };

  const claimDailyTokens = async () => {
    if (!profile || !canClaimDaily) return;

    setClaimLoading(true);
    try {
      const now = new Date().toISOString();
      await updateProfile({
        tokens: profile.tokens + 5,
        last_daily_token_claim: now,
      });
      toast.success('Daily tokens claimed! +5 tokens');
      setCanClaimDaily(false);
    } catch (error: any) {
      console.error('Error claiming daily tokens:', error);
      toast.error('Failed to claim daily tokens');
    } finally {
      setClaimLoading(false);
    }
  };

  const redeemPromoCode = async () => {
    if (!promoCode.trim() || !profile) return;

    setPromoLoading(true);
    try {
      const { data: promoData, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('active', true)
        .single();

      if (promoError || !promoData) {
        toast.error('Invalid or expired promo code');
        return;
      }

      if (promoData.current_uses >= promoData.max_uses) {
        toast.error('Promo code has reached its usage limit');
        return;
      }

      if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
        toast.error('Promo code has expired');
        return;
      }

      // Update user tokens
      await updateProfile({
        tokens: profile.tokens + promoData.tokens,
      });

      // Update promo code usage
      await supabase
        .from('promo_codes')
        .update({
          current_uses: promoData.current_uses + 1,
        })
        .eq('id', promoData.id);

      toast.success(`Promo code redeemed! +${promoData.tokens} tokens`);
      setPromoCode('');
    } catch (error: any) {
      console.error('Error redeeming promo code:', error);
      toast.error('Failed to redeem promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center">
          <Coins className="w-6 h-6 text-gold-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Token Management</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Manage your tokens and subscriptions
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Token Balance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Token Balance</h2>
              <div className="bg-gold-100 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-gold-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-600 mb-2">
                {profile?.tokens || 0}
              </div>
              <p className="text-gray-600">Available Tokens</p>
              <p className="text-sm text-gray-500 mt-2">
                Each content generation costs 1 token
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Daily Free Tokens */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Daily Free Tokens</h2>
              <div className="bg-myanmar-100 p-2 rounded-lg">
                <Gift className="w-5 h-5 text-myanmar-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {canClaimDaily ? (
                <div>
                  <p className="text-green-600 font-medium mb-4">
                    Free tokens available!
                  </p>
                  <Button
                    onClick={claimDailyTokens}
                    loading={claimLoading}
                    variant="secondary"
                    className="w-full"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Claim 5 Free Tokens
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center text-gray-500 mb-2">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Next claim available in 24 hours</span>
                  </div>
                  {profile?.last_daily_token_claim && (
                    <p className="text-sm text-gray-400">
                      Last claimed: {format(new Date(profile.last_daily_token_claim), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Promo Code */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Promo Code</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Enter Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="PROMO2024"
              />
              <Button
                onClick={redeemPromoCode}
                loading={promoLoading}
                variant="outline"
                className="w-full"
                disabled={!promoCode.trim()}
              >
                Redeem Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900 mb-2 capitalize">
                {profile?.subscription_type || 'Free'} Plan
              </div>
              {profile?.subscription_expires_at && (
                <p className="text-sm text-gray-600">
                  Expires: {format(new Date(profile.subscription_expires_at), 'MMM d, yyyy')}
                </p>
              )}
              <div className="mt-4 space-y-2">
                <Button variant="primary" size="sm" className="w-full">
                  Upgrade to Monthly ($10/month)
                </Button>
                <Button variant="secondary" size="sm" className="w-full">
                  Upgrade to Yearly ($99.9/year)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Usage Guide */}
      <Card className="mt-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">How Tokens Work</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="bg-myanmar-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-myanmar-600 font-bold">1</span>
              </div>
              <h3 className="font-medium text-gray-900">Generate Content</h3>
              <p className="text-sm text-gray-600">Each generation costs 1 token</p>
            </div>
            <div>
              <div className="bg-gold-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-gold-600 font-bold">5</span>
              </div>
              <h3 className="font-medium text-gray-900">Daily Free Tokens</h3>
              <p className="text-sm text-gray-600">Claim 5 free tokens every 24 hours</p>
            </div>
            <div>
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Unlimited</h3>
              <p className="text-sm text-gray-600">Subscribe for unlimited generations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}