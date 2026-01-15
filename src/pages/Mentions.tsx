import React from 'react';
import { motion } from 'framer-motion';

export default function Mentions() {
  return (
    <div className="min-h-screen bg-[#e6e6da] py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-3xl lg:text-4xl text-[#2f4858] mb-8">
            Mentions Légales
          </h1>

          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm space-y-8">
            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">Éditeur du Site</h2>
              <div className="text-[#2f4858]/70 leading-relaxed space-y-2">
                <p><strong>Raison sociale :</strong> Memorialis SARL</p>
                <p><strong>Siège social :</strong> Paris, France</p>
                <p><strong>Email :</strong> contact@memorialis.shop</p>
                <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">Hébergement</h2>
              <div className="text-[#2f4858]/70 leading-relaxed space-y-2">
                <p><strong>Site web :</strong> Memorialis Platform</p>
                <p><strong>Médias (photos & vidéos) :</strong> Bunny Storage</p>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">Propriété Intellectuelle</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                L'ensemble du contenu du site memorialis.shop (textes, images, design) est la
                propriété exclusive de Memorialis SARL. Toute reproduction, même partielle,
                est interdite sans autorisation préalable.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">Contenus Utilisateurs</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Les contenus (photos, vidéos, témoignages) ajoutés par les utilisateurs dans leurs
                mémoriaux restent leur propriété exclusive. Memorialis.shop s'engage à ne jamais
                les utiliser sans autorisation explicite.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">Limitation de Responsabilité</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Memorialis.shop met tout en œuvre pour garantir la disponibilité et la sécurité
                de ses services, mais ne peut être tenu responsable en cas d'interruption temporaire
                ou de perte de données due à des cas de force majeure.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-[#2f4858] mb-4">Contact</h2>
              <p className="text-[#2f4858]/70 leading-relaxed">
                Pour toute question concernant les mentions légales : contact@memorialis.shop
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
