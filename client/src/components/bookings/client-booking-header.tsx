interface LawyerProfile {
  name: string;
  oabNumber: string;
  photoUrl?: string;
  initials: string;
  rating?: number;
  reviewCount?: number;
}

interface ClientBookingHeaderProps {
  lawyer: LawyerProfile;
}

export function ClientBookingHeader({ lawyer }: ClientBookingHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-white text-xl font-bold mr-4">
              {lawyer.photoUrl ? (
                <img 
                  src={lawyer.photoUrl} 
                  alt={lawyer.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                lawyer.initials
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{lawyer.name}</h1>
              <p className="text-slate-500">{lawyer.oabNumber}</p>
              {lawyer.rating && (
                <div className="flex items-center mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-yellow-500 mr-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                  ))}
                  <span className="text-slate-500 text-sm ml-1">
                    {lawyer.rating} ({lawyer.reviewCount} avaliações)
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <a href="#" className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-slate-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contato
            </a>
            <a href="#" className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-slate-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ver local
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
