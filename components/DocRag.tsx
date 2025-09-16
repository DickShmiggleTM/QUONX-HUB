import React from 'react';
import Button from './Button';

const DocRag: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col text-lg bg-inherit text-black dark:text-gray-200">
        <h3 className="text-xl border-b-2 border-gray-400 dark:border-gray-600 mb-2">Document RAG</h3>
        <div className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md my-2">
            <div className="text-center text-gray-500">
                <p>Drag & Drop PDFs or other documents here</p>
                <p className="my-2">or</p>
                <Button onClick={() => alert('File upload not implemented.')}>
                    Browse Files
                </Button>
            </div>
        </div>
         <div className="mt-2">
            <h4 className="font-bold">Indexed Documents:</h4>
            <ul className="list-disc pl-5 mt-2 text-gray-600 dark:text-gray-400">
                <li>No documents indexed yet.</li>
            </ul>
        </div>
    </div>
  );
};

export default DocRag;
