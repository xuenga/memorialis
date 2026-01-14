import React from 'react';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#e6e6da] py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-3xl lg:text-4xl text-[#2f4858] mb-8">
            Politique de Confidentialité
          </h1>

          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm space-y-8">
            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">1. Collecte des Données</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Memorialis.shop collecte les données personnelles nécessaires au traitement de votre
                commande et à la gestion de votre espace mémorial : nom, prénom, email, adresse de livraison.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">2. Utilisation des Données</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Vos données sont utilisées uniquement pour : le traitement de votre commande,
                la gestion de votre espace mémorial, la communication relative à votre commande,
                l'amélioration de nos services.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">3. Protection des Données</h2>
              <p className="text-[#2f4858]/70 leading-relaxed mb-4">
                Toutes les données sont stockées de manière sécurisée. Les photos et vidéos sont
                hébergées sur des serveurs sécurisés avec chiffrement.
              </p>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Les paiements sont traités de manière sécurisée par Stripe, nous ne stockons aucune
                information bancaire.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">4. Vos Droits</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression
                et de portabilité de vos données. Pour exercer ces droits : contact@memorialis.shop
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">5. Cookies</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Notre site utilise des cookies essentiels au fonctionnement du panier et de l'authentification.
                Aucun cookie de tracking publicitaire n'est utilisé.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">6. Données du Mémorial</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Le contenu de votre mémorial (photos, vidéos, témoignages) vous appartient.
                Vous pouvez le modifier ou le supprimer à tout moment. Memorialis.shop s'engage
                à ne jamais utiliser ou partager ces contenus sans votre autorisation explicite.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
