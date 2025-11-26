import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Results = () => {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [stats, setStats] = useState({
    totalParticipants: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [sessionCode]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/session/${sessionCode}/results`);
      const data = await response.json();
      
      console.log('📊 Results data:', data);
      
      if (data.success) {
        setSession(data.session);
        setParticipants(data.participants || []);
        setQuizTitle(data.quizTitle || 'Quiz Results');
        calculateStats(data.participants || []);
      }
    } catch (error) {
      console.error('❌ Error fetching results:', error);
      alert('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (participants) => {
    if (participants.length === 0) {
      return;
    }

    const scores = participants.map(p => p.score);
    const total = participants.length;
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / total;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    const completed = participants.filter(p => 
      p.answers && p.answers.length > 0
    ).length;
    const completionRate = (completed / total) * 100;

    setStats({
      totalParticipants: total,
      averageScore: avg.toFixed(0),
      highestScore: highest,
      lowestScore: lowest,
      completionRate: completionRate.toFixed(0)
    });
  };

  const exportToCSV = async () => {
    try {
      setExporting('csv');
      console.log('📥 Exporting to CSV...');
      
      if (participants.length === 0) {
        alert('No participants data to export');
        return;
      }

      const headers = ['Rank', 'Name', 'Score', 'Questions Answered', 'Correct', 'Wrong', 'Accuracy %'];
      
      const rows = participants
        .sort((a, b) => b.score - a.score)
        .map((p, index) => {
          const correct = p.answers?.filter(a => a.isCorrect).length || 0;
          const total = p.answers?.length || 0;
          const wrong = total - correct;
          const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : '0';
          
          return [
            index + 1,
            p.name,
            p.score,
            total,
            correct,
            wrong,
            accuracy
          ];
        });
      
      let csvContent = headers.join(',') + '\n';
      
      rows.forEach(row => {
        csvContent += row.map(cell => {
          const stringCell = String(cell);
          return stringCell.includes(',') ? `"${stringCell.replace(/"/g, '""')}"` : stringCell;
        }).join(',') + '\n';
      });
      
      csvContent += '\n';
      csvContent += 'Summary Statistics\n';
      csvContent += `Total Participants,${stats.totalParticipants}\n`;
      csvContent += `Average Score,${stats.averageScore}\n`;
      csvContent += `Highest Score,${stats.highestScore}\n`;
      csvContent += `Lowest Score,${stats.lowestScore}\n`;
      csvContent += `Completion Rate,${stats.completionRate}%\n`;
      
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${quizTitle.replace(/\s+/g, '_')}_results_${sessionCode}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ CSV exported successfully');
      alert('CSV exported successfully!');
    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
      alert('Failed to export CSV: ' + error.message);
    } finally {
      setExporting(null);
    }
  };

  const exportToPDF = async () => {
    try {
      setExporting('pdf');
      console.log('📄 Exporting to PDF...');
      
      if (participants.length === 0) {
        alert('No participants data to export');
        return;
      }

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 15;

      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text(quizTitle, 14, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Session Code: ${sessionCode}`, 14, yPosition);
      yPosition += 6;
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 14, yPosition);
      yPosition += 6;
      pdf.text(`Time: ${new Date().toLocaleTimeString()}`, 14, yPosition);
      yPosition += 12;

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Summary Statistics', 14, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Total Participants: ${stats.totalParticipants}`, 14, yPosition);
      yPosition += 6;
      pdf.text(`Average Score: ${stats.averageScore}`, 14, yPosition);
      yPosition += 6;
      pdf.text(`Highest Score: ${stats.highestScore}`, 80, yPosition - 6);
      pdf.text(`Lowest Score: ${stats.lowestScore}`, 80, yPosition);
      yPosition += 6;
      pdf.text(`Completion Rate: ${stats.completionRate}%`, 140, yPosition - 6);
      yPosition += 12;

      const tableData = participants
        .sort((a, b) => b.score - a.score)
        .map((p, index) => {
          const correct = p.answers?.filter(a => a.isCorrect).length || 0;
          const total = p.answers?.length || 0;
          const wrong = total - correct;
          const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : '0';
          
          return [
            index + 1,
            p.name,
            p.score,
            total,
            correct,
            wrong,
            accuracy + '%'
          ];
        });

      pdf.autoTable({
        startY: yPosition,
        head: [['Rank', 'Name', 'Score', 'Answered', 'Correct', 'Wrong', 'Accuracy']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'left', cellWidth: 60 },
          2: { halign: 'center', cellWidth: 15 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'center', cellWidth: 15 },
          5: { halign: 'center', cellWidth: 15 },
          6: { halign: 'center', cellWidth: 20 }
        },
        margin: { top: 10, right: 10, left: 10, bottom: 10 }
      });

      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'italic');
      pdf.setTextColor(128, 128, 128);
      
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      const filename = `${quizTitle.replace(/\s+/g, '_')}_results_${sessionCode}.pdf`;
      pdf.save(filename);
      
      console.log('✅ PDF exported successfully');
      alert('PDF exported successfully!');
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      alert('Failed to export PDF: ' + error.message);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mb-4"></div>
          <p className="text-stone-600 text-lg font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-orange-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {quizTitle} - Results
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-stone-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    Session:
                  </p>
                  <span className="font-mono font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-lg border border-orange-300 text-sm">
                    {sessionCode}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                disabled={exporting === 'csv'}
                className="bg-green-100 text-green-700 px-5 py-2.5 rounded-xl hover:bg-green-200 transition-all font-bold border-2 border-green-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {exporting === 'csv' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>CSV</span>
                  </>
                )}
              </button>
              
              <button
                onClick={exportToPDF}
                disabled={exporting === 'pdf'}
                className="bg-red-100 text-red-700 px-5 py-2.5 rounded-xl hover:bg-red-200 transition-all font-bold border-2 border-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {exporting === 'pdf' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>PDF</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => navigate('/educator/dashboard')}
                className="bg-blue-100 text-blue-700 px-5 py-2.5 rounded-xl hover:bg-blue-200 transition-all font-bold border-2 border-blue-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Total</p>
            </div>
            <p className="text-4xl font-bold text-blue-600" style={{ fontFamily: "'Nunito', sans-serif" }}>{stats.totalParticipants}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Average</p>
            </div>
            <p className="text-4xl font-bold text-green-600" style={{ fontFamily: "'Nunito', sans-serif" }}>{stats.averageScore}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Highest</p>
            </div>
            <p className="text-4xl font-bold text-purple-600" style={{ fontFamily: "'Nunito', sans-serif" }}>{stats.highestScore}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Lowest</p>
            </div>
            <p className="text-4xl font-bold text-orange-600" style={{ fontFamily: "'Nunito', sans-serif" }}>{stats.lowestScore}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-200 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Complete</p>
            </div>
            <p className="text-4xl font-bold text-indigo-600" style={{ fontFamily: "'Nunito', sans-serif" }}>{stats.completionRate}%</p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <svg className="w-7 h-7 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Leaderboard
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider rounded-tl-xl" style={{ fontFamily: "'Nunito', sans-serif" }}>Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Nunito', sans-serif" }}>Participant</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Nunito', sans-serif" }}>Score</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Nunito', sans-serif" }}>Answered</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider rounded-tr-xl" style={{ fontFamily: "'Nunito', sans-serif" }}>Accuracy</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants
                  .sort((a, b) => b.score - a.score)
                  .map((participant, index) => {
                    const accuracy = participant.answers?.length > 0
                      ? ((participant.answers.filter(a => a.isCorrect).length / participant.answers.length) * 100).toFixed(0)
                      : 0;
                    
                    return (
                      <tr 
                        key={`${participant.participantId}-${index}`} 
                        className={`${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : 
                            <span className="text-lg font-bold text-gray-600" style={{ fontFamily: "'Nunito', sans-serif" }}>#{index + 1}</span>
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-stone-800 text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                          {participant.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xl font-bold text-blue-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                          {participant.score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                          {participant.answers?.length || 0} questions
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600 text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                          {accuracy}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Performance */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-8">
          <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <svg className="w-7 h-7 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Detailed Performance
          </h2>
          {participants
            .sort((a, b) => b.score - a.score)
            .map((participant, index) => (
            <div 
              key={`${participant.participantId}-detail-${index}`} 
              className="mb-6 p-6 border-2 border-gray-200 rounded-2xl hover:border-orange-300 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-stone-900 flex items-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                    {index + 1}
                  </span>
                  {participant.name}
                </h3>
                <span className="text-2xl font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-xl border-2 border-blue-300" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Score: {participant.score}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-100 rounded-xl border-2 border-gray-200">
                  <p className="text-sm text-stone-600 font-medium mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>Questions</p>
                  <p className="text-2xl font-bold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>{participant.answers?.length || 0}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <p className="text-sm text-green-700 font-medium mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>Correct</p>
                  <p className="text-2xl font-bold text-green-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {participant.answers?.filter(a => a.isCorrect).length || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
                  <p className="text-sm text-red-700 font-medium mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>Wrong</p>
                  <p className="text-2xl font-bold text-red-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {(participant.answers?.length || 0) - (participant.answers?.filter(a => a.isCorrect).length || 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-blue-700 font-medium mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>Accuracy</p>
                  <p className="text-2xl font-bold text-blue-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {participant.answers?.length > 0
                      ? ((participant.answers.filter(a => a.isCorrect).length / participant.answers.length) * 100).toFixed(0)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
