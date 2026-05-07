import { forwardRef } from 'react';
import { Pig } from '../context/AppContext';
import { differenceInDays, format } from 'date-fns';

interface CertificateProps {
  pig: Pig;
}

export const Certificate = forwardRef<HTMLDivElement, CertificateProps>(({ pig }, ref) => {
  const age = differenceInDays(new Date(), new Date(pig.birthDate));

  return (
    <div ref={ref} className="printable-area hidden print:block print:fixed print:top-0 print:left-0 print:w-screen print:h-screen print:z-50 bg-white p-10 text-center">
      <div className="border-2 border-gray-600 p-8 h-full flex flex-col items-center justify-between">
        
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold uppercase tracking-widest text-gray-900">Certificate of Registration</h1>
          <p className="text-xl italic font-serif text-gray-700">Official Pig Registry</p>
          <div className="w-32 h-1 bg-gray-800 mx-auto my-6"></div>
        </div>

        <div className="w-full text-left space-y-6 max-w-3xl mx-auto font-serif">
          <p className="text-xl">
            This is to certify that the swine described below has been duly registered in the 
            <strong> Municipality of Hinunangan, Southern Leyte</strong>.
          </p>

          <div className="grid grid-cols-2 gap-8 mt-10">
            <div>
              <p className="text-sm uppercase text-gray-500 font-bold">Owner Name</p>
              <p className="text-2xl border-b-2 border-gray-300 pb-1">{pig.ownerName}</p>
            </div>
            <div>
              <p className="text-sm uppercase text-gray-500 font-bold">Pig Tag Number</p>
              <p className="text-2xl border-b-2 border-gray-300 pb-1">{pig.tagNumber}</p>
            </div>
            <div>
              <p className="text-sm uppercase text-gray-500 font-bold">Classification</p>
              <p className="text-2xl border-b-2 border-gray-300 pb-1">{pig.status}</p>
            </div>
            <div>
              <p className="text-sm uppercase text-gray-500 font-bold">Age</p>
              <p className="text-2xl border-b-2 border-gray-300 pb-1">{age} Days</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm uppercase text-gray-500 font-bold">Location</p>
              <p className="text-xl border-b-2 border-gray-300 pb-1">
                {pig.street}, {pig.barangay}, {pig.municipality}, {pig.province}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-between items-end mt-16 px-10">
          <div className="text-center">
            <p className="text-lg font-bold border-t border-gray-800 px-8 pt-2">Registered By</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold border-t border-gray-800 px-8 pt-2">Date Issued</p>
            <p>{format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

Certificate.displayName = 'Certificate';
