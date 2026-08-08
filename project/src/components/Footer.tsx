import { Utensils, Heart, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-lg text-white">MessCard</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              The digital mess card platform connecting students and IT professionals with
              hostels and PGs that serve fresh, home-style meals every day. No more cooking,
              no more hassle — just subscribe and eat.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Browse Mess</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">For Hostels</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Get in Touch</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@messcard.app</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© 2026 MessCard. All rights reserved.</p>
          <p className="text-xs flex items-center gap-1">Made with <Heart className="w-3 h-3 text-primary-500 fill-primary-500" /> for students & professionals</p>
        </div>
      </div>
    </footer>
  );
}
