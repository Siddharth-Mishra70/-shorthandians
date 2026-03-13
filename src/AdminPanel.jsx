import React, { useState } from 'react';
import {
    Users, Headphones, Scale, FileText, BarChart2,
    Settings, LogOut, Search, Plus, Edit2, Trash2
} from 'lucide-react';

const AdminPanel = ({ user, onLogout }) => {
    const [currentTab, setCurrentTab] = useState('students');

    const SidebarItem = ({ icon: Icon, label, tabId }) => (
        <div
            onClick={() => setCurrentTab(tabId)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                currentTab === tabId
                    ? 'bg-[#1e3a8a] text-white'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-[#1e3a8a]'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </div>
    );

    const renderContent = () => {
        switch (currentTab) {
            case 'students':
                return (
                    <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Student Registration Details</h2>
                            <div className="flex bg-white border border-gray-300 rounded-lg px-3 py-2 items-center shadow-sm focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-transparent transition-all">
                                <Search className="w-4 h-4 text-gray-400 mr-2" />
                                <input type="text" placeholder="Search students..." className="outline-none text-sm bg-transparent" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Name</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Phone</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Joined Date</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Status</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">Rahul Kumar</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">+91 9876543210</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">12 Mar 2024</td>
                                        <td className="px-6 py-4 text-sm"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">Active</span></td>
                                        <td className="px-6 py-4 text-sm text-right space-x-3">
                                            <button className="text-blue-600 hover:text-blue-800 transition-colors tooltip" title="Edit">
                                                <Edit2 className="w-4 h-4 inline" />
                                            </button>
                                            <button className="text-red-500 hover:text-red-700 transition-colors tooltip" title="Delete">
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">Sneha Patel</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">+91 8765432109</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">13 Mar 2024</td>
                                        <td className="px-6 py-4 text-sm"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">Active</span></td>
                                        <td className="px-6 py-4 text-sm text-right space-x-3">
                                            <button className="text-blue-600 hover:text-blue-800 transition-colors tooltip" title="Edit">
                                                <Edit2 className="w-4 h-4 inline" />
                                            </button>
                                            <button className="text-red-500 hover:text-red-700 transition-colors tooltip" title="Delete">
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'audio':
                return (
                    <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Audio Dictations Management</h2>
                            <button className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-bold hover:bg-blue-800 transition-all shadow-md hover:-translate-y-0.5">
                                <Plus className="w-4 h-4 mr-2" /> Upload Audio
                            </button>
                        </div>
                        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
                                <Headphones className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 mb-1">No Dictations Uploaded</h3>
                            <p className="max-w-md mx-auto text-sm">Upload audio files here for students to practice dictation tests.</p>
                        </div>
                    </div>
                );
            case 'highcourt':
                return (
                    <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">High Court Data Management</h2>
                            <button className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-bold hover:bg-blue-800 transition-all shadow-md hover:-translate-y-0.5">
                                <Plus className="w-4 h-4 mr-2" /> Add Sample Document
                            </button>
                        </div>
                        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
                                <Scale className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 mb-1">No High Court Data</h3>
                            <p className="max-w-md mx-auto text-sm">Add custom document text for the High Court formatting mock test.</p>
                        </div>
                    </div>
                );
            case 'mock_tests':
                return (
                    <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Mock Tests Builder</h2>
                            <button className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-bold hover:bg-blue-800 transition-all shadow-md hover:-translate-y-0.5">
                                <Plus className="w-4 h-4 mr-2" /> Load New Test
                            </button>
                        </div>
                        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 mb-1">No Tests Loaded</h3>
                            <p className="max-w-md mx-auto text-sm">Create and load comprehensive mock tests for student evaluations.</p>
                        </div>
                    </div>
                );
            case 'results':
                return (
                    <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">All Student Results</h2>
                            <div className="flex bg-white border border-gray-300 rounded-lg px-3 py-2 items-center shadow-sm focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-transparent transition-all">
                                <Search className="w-4 h-4 text-gray-400 mr-2" />
                                <input type="text" placeholder="Search results..." className="outline-none text-sm bg-transparent" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Student Name</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Test Taken</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Stats (WPM / Acc)</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Date Completed</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">Rahul Kumar</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">Kailash Chandra Vol 1</td>
                                        <td className="px-6 py-4 text-sm text-gray-600"><span className="font-bold text-[#1e3a8a]">85 WPM</span> / <span className="font-bold text-green-600">92%</span></td>
                                        <td className="px-6 py-4 text-sm text-gray-600">14 Mar 2024, 10:30 AM</td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <button className="text-[#1e3a8a] hover:text-blue-700 hover:underline font-bold transition-colors">View Analysis</button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">Sneha Patel</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">SSC Grade C & D Mock</td>
                                        <td className="px-6 py-4 text-sm text-gray-600"><span className="font-bold text-[#1e3a8a]">102 WPM</span> / <span className="font-bold text-green-600">98%</span></td>
                                        <td className="px-6 py-4 text-sm text-gray-600">13 Mar 2024, 2:15 PM</td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <button className="text-[#1e3a8a] hover:text-blue-700 hover:underline font-bold transition-colors">View Analysis</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white shadow-sm border-b z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-700 rounded-lg flex justify-center items-center shadow-sm">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                            Admin <span className="text-red-700">Portal</span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-2 bg-red-50 border border-red-100 px-4 py-2 rounded-full">
                            <div className="w-7 h-7 bg-red-700 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">AD</span>
                            </div>
                            <span className="font-semibold text-red-700 text-sm">{user?.name || 'Administrator'}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="flex items-center space-x-2 border-2 border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-600 hover:text-red-600 px-4 py-2 rounded-full font-semibold transition-all text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full mx-auto flex flex-col md:flex-row overflow-hidden relative max-w-[1600px]">
                <aside className="w-full md:w-64 bg-white md:border-r border-b md:border-b-0 py-6 px-4 flex flex-col md:min-h-[calc(100vh-80px)] shrink-0">
                    <div className="px-4 mb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Management</div>
                    <nav className="space-y-2 flex-1">
                        <SidebarItem icon={Users} label="Student Details" tabId="students" />
                        <SidebarItem icon={Headphones} label="Audio Dictations" tabId="audio" />
                        <SidebarItem icon={Scale} label="High Court Data" tabId="highcourt" />
                        <SidebarItem icon={FileText} label="Load Mock Tests" tabId="mock_tests" />
                        <div className="my-4 border-t border-gray-100"></div>
                        <div className="px-4 mb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Reports</div>
                        <SidebarItem icon={BarChart2} label="All Student Results" tabId="results" />
                    </nav>
                </aside>
                <main className="flex-1 p-6 lg:p-10 bg-gray-50 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;
