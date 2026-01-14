import React from 'react';
import { motion } from 'framer-motion';

export default function CGV() {
  return (
    <div className="min-h-screen bg-[#e6e6da] py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-3xl lg:text-4xl text-[#2f4858] mb-8">
            Conditions Générales de Vente
          </h1>

          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm space-y-8">
            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">1. Objet</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Les présentes conditions générales de vente régissent les relations contractuelles 
                entre Memorialis.shop et tout client passant commande sur le site memorialis.shop.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">2. Produits et Services</h2>
              <p className="text-[#2f4858]/70 leading-relaxed mb-4">
                Memorialis.shop propose à la vente des plaques commémoratives physiques (autocollantes, 
                plexiglass, métal) accompagnées d'un espace numérique mémorial accessible via QR code.
              </p>
              <p className="text-[#2f4858]/70 leading-relaxed">
                L'espace numérique permet de stocker et partager des photos, vidéos et témoignages de 
                manière illimitée et permanente.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">3. Prix et Paiement</h2>
              <p className="text-[#2f4858]/70 leading-relaxed mb-4">
                Les prix sont indiqués en euros TTC. Le paiement est effectué de manière sécurisée 
                via Stripe. Les moyens de paiement acceptés sont : cartes bancaires (Visa, Mastercard, 
                American Express).
              </p>
              <p className="text-[#2f4858]/70 leading-relaxed">
                La commande est validée après confirmation du paiement.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">4. Livraison</h2>
              <p className="text-[#2f4858]/70 leading-relaxed mb-4">
                Les délais de livraison sont de 5 à 7 jours ouvrés en France métropolitaine. 
                La livraison est offerte pour toute commande.
              </p>
              <p className="text-[#2f4858]/70 leading-relaxed">
                L'espace numérique est accessible immédiatement après validation de la commande.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">5. Droit de Rétractation</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours à 
                compter de la réception du produit pour exercer votre droit de rétractation, 
                sauf pour les produits personnalisés.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">6. Garanties</h2>
              <p className="text-[#2f4858]/70 leading-relaxed mb-4">
                Tous nos produits physiques bénéficient d'une garantie de 2 ans (5 ans pour les 
                plaques métal) contre les défauts de fabrication.
              </p>
              <p className="text-[#2f4858]/70 leading-relaxed">
                L'espace numérique est garanti accessible à vie, tant que Memorialis.shop existe.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">7. Contact</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Pour toute question relative aux CGV : contact@memorialis.shop
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
