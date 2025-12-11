import React, { useState } from 'react';
import { generateVaccinationSchedule } from '../services/geminiService';
import { VaccinationScheduleItem } from '../types';
import { Calendar, Baby, Loader2, Download } from 'lucide-react';

export default function Vaccination() {
  const [childName, setChildName] = useState('');
  const [dob, setDob] = useState('');
  const [schedule, setSchedule] = useState<VaccinationScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName || !dob) return;

    setLoading(true);
    setError('');
    setSchedule([]);

    try {
      const data = await generateVaccinationSchedule(childName, dob);
      if (Array.isArray(data)) {
        setSchedule(data);
      } else {
        throw new Error("Invalid format received");
      }
    } catch (err) {
      setError("Failed to generate schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Baby size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vaccination Schedule Generator</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your child's details to get a personalized immunization timeline.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Child's Name</label>
            <input
              type="text"
              required
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
              placeholder="e.g. Aarav"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Calendar className="w-5 h-5 mr-2" />}
            Generate Schedule
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>

      {schedule.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">Immunization Timeline for {childName}</h3>
            <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium flex items-center">
              <Download size={16} className="mr-1" /> Save PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Age / Due Date</th>
                  <th className="px-6 py-3">Vaccines</th>
                  <th className="px-6 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {schedule.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{item.ageGroup}</div>
                      <div className="text-xs text-gray-500">{item.dueDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {item.vaccines.map((v, i) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}