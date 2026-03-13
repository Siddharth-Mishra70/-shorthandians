import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, CheckCircle2, Share2, X, FileCheck, ArrowLeft, Eye, Clock } from 'lucide-react';
import { supabase } from './supabaseClient';

const pitmanExercises = [
    {
        id: 'ex-110',
        title: 'Exercise 110',
        words: 188,
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Pitman_shorthand.png',
        lines: [
            "I should like to say a few words about the budget.",
            "First of all I must congratulate the Finance Minister on his excellent performance.",
            "He has shown a great deal of courage and foresight in preparing this budget.",
            "There are many new taxes, but they are necessary for the development of our country.",
            "I hope that the people will bear this burden cheerfully.",
            "We must all work hard to make our five-year plan a success.",
            "The progress we have made so far is very encouraging.",
            "I am sure that under the able leadership of our Prime Minister we shall achieve our goals.",
            "Let us all unite and work together for the prosperity of our great nation."
        ]
    },
    {
        id: 'ex-111',
        title: 'Exercise 111',
        words: 125,
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Pitman_shorthand.png',
        lines: [
            "This is a supplementary exercise to build speed.",
            "Continuous practice is essential for mastering these complex outlines.",
            "In this dictation you will find many joined phrases and special contractions.",
            "Read the shorthand passage carefully before attempting transcription.",
            "Remember that accuracy is just as important as speed when submitting exams."
        ]
    },
    {
        id: 'ex-112',
        title: 'Exercise 112',
        words: 145,
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Pitman_shorthand.png',
        lines: [
            "Legal proceedings demand extreme precision from the reporter.",
            "The judge issued an order directly affecting the outcome of the writ jurisdiction case.",
            "All pending dues were processed along with the statutory interest demanded.",
            "Focus completely on the audio and immediately map sounds to strokes.",
            "The High Court requires dedicated commitment and error-free typing."
        ]
    }
];

const PitmanAPSModule = ({ onBack }) => {
    const [selectedExercise, setSelectedExercise] = useState(pitmanExercises[0]);
    const mockReferenceText = selectedExercise.lines.join(' ');

    const [inputText, setInputText] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 mins
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);

    // Audio & Transcription
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(80); // Speed in WPM
    const [audioProgress, setAudioProgress] = useState(0);
    const [showKey, setShowKey] = useState(false);
    const utteranceRef = useRef(null);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [finalStats, setFinalStats] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useEffect(() => {
        let timer;
        if (isStarted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isStarted, timeLeft]);

    useEffect(() => {
        if (!isStarted || inputText.length === 0) return;
        const timeElapsed = (600 - timeLeft) / 60;
        if (timeElapsed > 0) {
            const wordsTyped = inputText.trim().split(/\s+/).length;
            setWpm(Math.round(wordsTyped / timeElapsed));
        }

        const refWords = mockReferenceText.split(' ');
        const typedWords = inputText.trim().split(/\s+/);
        let correctWords = 0;
        typedWords.forEach((word, index) => {
            if (word === refWords[index]) correctWords++;
        });
        setAccuracy(typedWords.length > 0 ? Math.round((correctWords / typedWords.length) * 100) : 100);
    }, [inputText, timeLeft, isStarted]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (e) => {
        if (!isStarted) setIsStarted(true);
        setInputText(e.target.value);
    };

    // Audio setup mapping WPM presets to speech synthesis rates
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance(mockReferenceText);
            u.lang = 'en-IN';
            u.rate = playbackSpeed / 100; // rough mapping: 80 wpm -> 0.8
            u.onboundary = (e) => {
                const progress = (e.charIndex / mockReferenceText.length) * 100;
                setAudioProgress(progress);
            };
            u.onend = () => {
                setIsPlaying(false);
                setAudioProgress(100);
            };
            u.onerror = () => setIsPlaying(false);
            utteranceRef.current = u;
        }
        return () => window.speechSynthesis?.cancel();
    }, [playbackSpeed, mockReferenceText]);

    const togglePlayPause = () => {
        if (!utteranceRef.current) return;
        if (isPlaying) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
        } else {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            } else {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utteranceRef.current);
            }
            setIsPlaying(true);
        }
    };

    const resetAudio = () => {
        window.speechSynthesis?.cancel();
        setIsPlaying(false);
        setAudioProgress(0);
    };

    const handleSpeedChange = (speedPreset) => {
        setPlaybackSpeed(speedPreset);
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setAudioProgress(0);
        }
    };

    const handleReset = () => {
        setInputText('');
        setIsStarted(false);
        setTimeLeft(600);
        setWpm(0);
        setAccuracy(100);
        setIsPlaying(false);
        setHasSubmitted(false);
        setShowKey(false);
    };

    const calculateFinalStats = () => {
        const refWords = selectedExercise.lines.join(' ').split(' ');
        const typedWords = inputText.trim().split(/\s+/).filter(w => w !== '');

        let fullMistakes = 0;
        let halfMistakes = 0;

        refWords.forEach((refWord, index) => {
            const typedWord = typedWords[index] || '';
            if (typedWord === refWord) return;
            if (!typedWord) {
                fullMistakes++;
                return;
            }
            const cleanRef = refWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
            const cleanTyped = typedWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();

            if (cleanRef === cleanTyped) halfMistakes++;
            else fullMistakes++;
        });

        if (typedWords.length > refWords.length) {
            fullMistakes += (typedWords.length - refWords.length);
        }

        const timeElapsedMin = (600 - timeLeft) / 60;
        const validTime = timeElapsedMin > 0 ? timeElapsedMin : 1;
        const totalWords = typedWords.length;
        const deduction = fullMistakes + (halfMistakes * 0.5);
        let finalWpm = Math.max(0, Math.round((totalWords - deduction) / validTime));
        let finalAcc = refWords.length > 0 ? Math.max(0, Math.round(((refWords.length - deduction) / refWords.length) * 100)) : 100;

        return { wpm: finalWpm, accuracy: finalAcc, fullMistakes, halfMistakes, totalWords };
    };

    const handleSubmit = async () => {
        setIsStarted(false);
        resetAudio();

        const stats = calculateFinalStats();
        setFinalStats(stats);
        setShowModal(true);
        setIsSaving(true);
        setHasSubmitted(true);

        try {
            const { error } = await supabase
                .from('test_results')
                .insert([
                    {
                        user_id: '00000000-0000-0000-0000-000000000000',
                        exercise_name: `${selectedExercise.title} (Pitman_APS)`,
                        wpm: stats.wpm,
                        accuracy: stats.accuracy,
                        mistakes: stats.fullMistakes + Math.ceil(stats.halfMistakes * 0.5),
                        total_words: stats.totalWords,
                        created_at: new Date().toISOString()
                    }
                ]);
            if (error) console.error("Supabase Warning:", error.message);
        } catch (error) {
            console.error('Error saving stats:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleWhatsAppShare = () => {
        const text = `Hi Ayush Sir, I've just completed the Pitman APS mock test.\n\n*Exercise:* ${selectedExercise.title} (Allahabad HC)\n*WPM:* ${finalStats?.wpm}\n*Accuracy:* ${finalStats?.accuracy}%\n*Full Mistakes:* ${finalStats?.fullMistakes}\n*Half Mistakes:* ${finalStats?.halfMistakes}\n\nPlease review my performance. Thank you!`;
        window.open(`https://wa.me/917080811235?text=${encodeURIComponent(text)}`, '_blank');
    };

    const renderKey = () => {
        return selectedExercise.lines.map((line, idx) => (
            <p key={idx} className="mb-2 text-gray-800 leading-relaxed">{line}</p>
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-[#1e3a8a] text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-md z-10">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <button onClick={onBack} className="hover:bg-blue-800 p-2 rounded-full transition-colors" title="Back to Dashboard">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold tracking-wide">Pitman APS Module</h2>
                        <span className="text-xs text-blue-200">{selectedExercise.title} • Allahabad High Court</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        className="bg-blue-800/50 text-white text-sm font-bold px-3 py-1.5 rounded-lg outline-none border border-blue-700 focus:border-blue-400"
                        value={selectedExercise.id}
                        onChange={(e) => {
                            const ex = pitmanExercises.find(x => x.id === e.target.value);
                            setSelectedExercise(ex);
                            handleReset();
                        }}
                        disabled={isStarted || hasSubmitted}
                    >
                        {pitmanExercises.map(ex => (
                            <option key={ex.id} value={ex.id} className="bg-white text-gray-900">{ex.title}</option>
                        ))}
                    </select>

                    <div className="flex items-center space-x-2 bg-blue-800/50 px-3 py-1.5 rounded-lg text-sm">
                        <Activity className="w-4 h-4 text-blue-200" />
                        <span>{Math.max(0, wpm)} WPM</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-blue-800/50 px-3 py-1.5 rounded-lg text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-300" />
                        <span>{accuracy}%</span>
                    </div>
                </div>
            </div>

            {/* Audio Controller */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={togglePlayPause} className="w-10 h-10 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-800 transition-colors">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                    </button>
                    <button onClick={resetAudio} className="w-8 h-8 text-gray-500 hover:text-[#1e3a8a] transition-colors rounded-full" title="Restart Dictation">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="hidden sm:flex flex-col ml-2 w-32 md:w-64">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Dictation Progress</span>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1e3a8a] transition-all duration-100 ease-linear" style={{ width: `${audioProgress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
                    <span className="text-xs font-bold text-gray-500 px-2 uppercase tracking-wide">Target Speed:</span>
                    {[40, 50, 60, 80, 90, 100].map(speed => (
                        <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${playbackSpeed === speed ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            {speed} WPM
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">

                {/* Left Side: Shorthand Strokes Image */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden h-full">
                    <div className="bg-gray-100 px-4 py-3 border-b text-sm font-bold text-gray-600 uppercase flex justify-between items-center">
                        <span>Shorthand Outlines</span>
                        <span className="text-xs font-normal text-gray-400">{selectedExercise.title} ({selectedExercise.words} Words)</span>
                    </div>
                    <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto bg-[#f8fbff]">
                        {/* Placeholder image resembling shorthand script */}
                        <img
                            src={selectedExercise.image}
                            alt="Pitman Shorthand Strokes"
                            className="max-w-full h-auto opacity-70 contrast-125 filter mix-blend-multiply"
                        />
                        <p className="mt-8 text-sm text-gray-400 font-medium italic">Read these strokes and transcribe the passage exactly onto the right panel.</p>
                    </div>
                </div>

                {/* Right Side: Standard Typing Engine */}
                <div className="flex flex-col h-full space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center space-x-2">
                            <FileCheck className="w-5 h-5 text-green-600" />
                            <span>Your Transcription</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className={`font-mono font-bold text-lg ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    <textarea
                        className="flex-1 w-full bg-white border-2 border-gray-200 focus:border-[#1e3a8a] rounded-xl p-5 shadow-sm text-lg outline-none resize-none transition-colors"
                        placeholder="Start typing your transcription here... (Timer starts automatically)"
                        value={inputText}
                        onChange={handleInputChange}
                        onCopy={e => e.preventDefault()}
                        onPaste={e => e.preventDefault()}
                        onContextMenu={e => e.preventDefault()}
                        disabled={timeLeft === 0 || hasSubmitted}
                        spellCheck="false"
                    />

                    {/* Review Section (Shows only after submission) */}
                    {hasSubmitted && (
                        <div className="bg-white border-2 border-amber-200 rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center">
                                    <Eye className="w-4 h-4 mr-2" /> Expert Review Mode
                                </h3>
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded transition-colors"
                                >
                                    {showKey ? 'Hide Original Key' : 'Reveal Original Key'}
                                </button>
                            </div>

                            {showKey ? (
                                <div className="bg-amber-50 p-4 rounded border border-amber-100 font-serif text-[15px]">
                                    {renderKey()}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic">Click the reveal button to compare your text with the exact original English passage.</p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border border-gray-200 rounded-xl shadow-sm">
                        <button
                            onClick={handleReset}
                            className="px-5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-lg transition-colors text-sm"
                        >
                            Reset Module
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={hasSubmitted || (!isStarted && inputText.length === 0)}
                            className={`px-6 py-2.5 font-bold rounded-lg transition-transform shadow-md flex items-center space-x-2 text-sm ${hasSubmitted ? 'bg-green-600 text-white cursor-default' :
                                (!isStarted && inputText.length === 0) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                                    'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                                }`}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{hasSubmitted ? 'Submitted' : 'Submit Transcription'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Same Validation Modal from TypingArena */}
            {
                showModal && finalStats && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md animate-in fade-in zoom-in duration-300">
                            <div className="bg-[#1e3a8a] py-6 px-6 text-center text-white relative">
                                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-blue-200 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                                <FileCheck className="w-16 h-16 mx-auto mb-3 text-blue-100" />
                                <h2 className="text-2xl font-black">Submission Successful</h2>
                                <p className="text-blue-200 font-medium tracking-wide">Allahabad HC (APS) Results</p>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Final WPM</span>
                                        <span className="text-3xl font-black text-[#1e3a8a]">{finalStats.wpm}</span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Accuracy</span>
                                        <span className="text-3xl font-black text-green-600">{finalStats.accuracy}%</span>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-xl text-center border border-red-100">
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest block mb-1">Total Mistakes</span>
                                        <span className="text-2xl font-bold text-red-600">{finalStats.fullMistakes + finalStats.halfMistakes}</span>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl text-center border border-amber-100">
                                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">Half Mistakes</span>
                                        <span className="text-2xl font-bold text-amber-600">{finalStats.halfMistakes}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-3">
                                    {isSaving ? (
                                        <div className="text-center text-gray-400 font-bold text-sm py-2">Saving to Database...</div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleWhatsAppShare}
                                                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md transition-colors"
                                            >
                                                <Share2 className="w-5 h-5" />
                                                <span>Share on WhatsApp</span>
                                            </button>
                                            <button
                                                onClick={() => setShowModal(false)}
                                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-[#1e3a8a] font-bold rounded-xl transition-colors"
                                            >
                                                Review Transcription
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default PitmanAPSModule;
