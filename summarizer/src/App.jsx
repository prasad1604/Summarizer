import React, { useState, useRef } from 'react';

// Sample meeting data
const sampleMeetings = {
  "meeting1": {
    "id": "meeting1",
    "fileName": "project-planning.mp3",
    "duration": "25:30",
    "transcript": "Welcome everyone to today's project planning meeting. I'm Sarah, the project manager, and we have John from development, Lisa from design, and Mike from QA joining us today.\n\n[00:02:15] Sarah: Let's start by reviewing our current project status. We're working on the new e-commerce platform and we're currently in week 3 of development.\n\n[00:03:45] John: On the development side, we've completed the user authentication system and the product catalog. We're currently working on the shopping cart functionality. I estimate we'll need another week to complete this.\n\n[00:05:20] Lisa: From the design perspective, I've finished all the wireframes and mockups for the main user flows. The team has approved them, and I'm now working on the mobile responsive designs.\n\n[00:07:10] Mike: For QA, I've set up the testing environment and created test cases for the completed features. I'll begin testing the shopping cart once John's development is done.\n\n[00:08:45] Sarah: Great updates everyone. Now let's discuss our timeline. We have a hard deadline of December 15th for the beta launch. Based on current progress, are we on track?\n\n[00:10:30] John: I think we're slightly behind. The shopping cart is more complex than initially estimated. I'll need an additional developer to help meet the deadline.\n\n[00:12:00] Sarah: I can arrange for Tom to join your team starting Monday. Lisa, when will the mobile designs be ready?\n\n[00:13:15] Lisa: I'll have them completed by Friday this week. That should give development enough time to implement them.\n\n[00:14:45] Mike: I'll coordinate with John to start parallel testing as features become available. This should help us catch issues early.\n\n[00:16:20] Sarah: Perfect. Let's also discuss the client presentation scheduled for next week. We need to prepare a demo of the current functionality.\n\n[00:18:00] John: I can have a working demo environment ready by Wednesday. It will include user registration, login, and product browsing.\n\n[00:19:30] Lisa: I'll create a presentation deck highlighting the design decisions and user experience improvements.\n\n[00:21:00] Sarah: Excellent. Mike, can you prepare a testing report to show our quality assurance process?\n\n[00:22:15] Mike: Absolutely. I'll include our testing strategy, current test coverage, and the bug tracking process.\n\n[00:23:45] Sarah: Before we wrap up, any other concerns or blockers we need to address?\n\n[00:24:30] John: Just the additional developer resource we discussed. Other than that, I think we're good.\n\n[00:25:00] Sarah: I'll send out meeting notes with all action items by end of day. Thanks everyone for the productive discussion.",
    "summary": "Project planning meeting for e-commerce platform development. Team discussed current progress, timeline concerns, and preparation for upcoming client presentation. Development is slightly behind schedule due to shopping cart complexity.",
    "actionItems": [
      "Sarah to arrange for Tom to join development team starting Monday",
      "Lisa to complete mobile responsive designs by Friday",
      "John to prepare working demo environment by Wednesday",
      "Lisa to create presentation deck for client meeting",
      "Mike to prepare testing report for client presentation",
      "Sarah to send out meeting notes with action items by end of day"
    ],
    "decisions": [
      "Add additional developer (Tom) to development team to meet December 15th deadline",
      "Proceed with parallel testing approach to catch issues early",
      "Client presentation will include demo of user registration, login, and product browsing",
      "Demo environment to be ready by Wednesday for client presentation"
    ],
    "participants": ["Sarah (Project Manager)", "John (Developer)", "Lisa (Designer)", "Mike (QA Engineer)"]
  },
  "meeting2": {
    "id": "meeting2", 
    "fileName": "team-standup.mp3",
    "duration": "12:45",
    "transcript": "[00:00:15] Alex: Good morning everyone. Let's start our daily standup. I'll go first with my updates.\n\n[00:00:45] Alex: Yesterday I completed the API integration for the payment gateway. Today I'm planning to work on error handling and validation. No blockers currently.\n\n[00:01:30] Jennifer: Thanks Alex. Jennifer here - yesterday I finished the user dashboard wireframes and got approval from the design team. Today I'm starting on the admin panel designs. No blockers for me either.\n\n[00:02:15] Carlos: Carlos checking in. I completed unit tests for the authentication module yesterday. Found two minor bugs which I've already fixed. Today I'll be working on integration tests. My only concern is waiting for the updated API documentation from Alex.\n\n[00:03:00] Alex: Carlos, I'll have that documentation updated and shared by noon today.\n\n[00:03:30] Maria: Maria here. I spent yesterday setting up the production deployment pipeline. Everything is configured and tested. Today I'm working on monitoring and alerting setup. No blockers.\n\n[00:04:15] David: David from marketing. Yesterday we launched the beta user recruitment campaign. We've already got 50 signups which is ahead of our target. Today I'm analyzing user feedback from our surveys. No issues.\n\n[00:05:00] Alex: Great numbers David! Any particular feedback themes emerging?\n\n[00:05:30] David: Users are really excited about the simplified onboarding process. A few have requested dark mode which I'll add to our feature backlog.\n\n[00:06:15] Jennifer: I can prioritize dark mode in the design system. Should be straightforward to implement.\n\n[00:06:45] Alex: Perfect. Let's discuss today's priorities. We're aiming to complete the payment integration testing and have the admin panel designs ready for development.\n\n[00:07:30] Carlos: I should have the integration tests completed by end of day, assuming I get the API docs by noon.\n\n[00:08:00] Jennifer: Admin panel designs will be ready by 3 PM. I'll share them in our design channel.\n\n[00:08:30] Maria: I'll have monitoring fully configured by end of day. We'll be ready for the production deployment next week.\n\n[00:09:15] Alex: Excellent progress everyone. Any concerns about next week's production deployment?\n\n[00:09:45] Maria: Database migration is the only potential risk. I've tested it extensively in staging, but we should plan for a potential rollback scenario.\n\n[00:10:30] Alex: Good point. Let's schedule a deployment review meeting for Friday to go over the rollback procedures.\n\n[00:11:00] Carlos: I'll make sure all tests are passing before we deploy. We should have full test coverage by Thursday.\n\n[00:11:30] Alex: Perfect. Any other items before we wrap up?\n\n[00:12:00] David: Just a reminder that our stakeholder demo is scheduled for next Tuesday. We should coordinate on what features to showcase.\n\n[00:12:30] Alex: Great reminder. I'll send out a demo planning agenda. Thanks everyone, have a productive day!",
    "summary": "Daily standup meeting covering progress on payment gateway integration, design work, testing, deployment pipeline, and marketing campaign. Team is on track for next week's production deployment.",
    "actionItems": [
      "Alex to update and share API documentation by noon",
      "Jennifer to complete admin panel designs by 3 PM",
      "Carlos to complete integration tests by end of day",
      "Maria to finish monitoring and alerting setup by end of day",
      "Alex to schedule deployment review meeting for Friday",
      "Carlos to ensure full test coverage by Thursday",
      "Alex to send demo planning agenda for Tuesday stakeholder meeting"
    ],
    "decisions": [
      "Dark mode feature to be added to product backlog",
      "Jennifer to prioritize dark mode in design system",
      "Schedule deployment review meeting for Friday to cover rollback procedures",
      "Stakeholder demo confirmed for next Tuesday"
    ],
    "participants": ["Alex (Team Lead)", "Jennifer (Designer)", "Carlos (Developer)", "Maria (DevOps)", "David (Marketing)"]
  }
};
const processingStages = ['Uploading', 'Transcribing', 'Analyzing', 'Summarizing', 'Complete'];

export default function App() {
  // State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processingFiles, setProcessingFiles] = useState([]);
  const [currentResults, setCurrentResults] = useState(null);
  const [settings, setSettings] = useState({
    summaryLength: 'Medium',
    includeTimestamps: true,
    speakerIdentification: true,
    language: 'English',
  });
  const [section, setSection] = useState('upload'); // upload, processing, results
  const [processingStatus, setProcessingStatus] = useState({}); // fileId -> {status, progress}

  // Refs for file input
  const fileInputRef = useRef(null);

  // Helper: format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // File add handler
  const addFiles = (files) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/flac'];
    const validExtensions = ['.mp3', '.wav', '.mp4', '.m4a', '.flac'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    const newFiles = Array.from(files).filter(file => {
      const hasValidType = validTypes.includes(file.type);
      const hasValidExtension = validExtensions.some(ext =>
        file.name.toLowerCase().endsWith(ext)
      );
      const isValidSize = file.size <= maxSize;
      return (hasValidType || hasValidExtension) && isValidSize;
    }).filter(file => !selectedFiles.some(f => f.name === file.name && f.size === file.size))
      .map(file => ({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        file: file
      }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // Remove file
  const removeFile = (id) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Handle file input change
  const onFileInputChange = (e) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  // Drag and drop event handlers
  const onDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => e.preventDefault();

  // Processing simulation for one file
  const simulateFileProcessing = (file) => {
  return new Promise((resolve) => {
    const run = async () => {
      for (let i = 0; i < processingStages.length; i++) {
        const status = processingStages[i];
        setProcessingStatus(prev => ({
          ...prev,
          [file.id]: { status, progress: (i / (processingStages.length - 1)) * 100 }
        }));
        await new Promise(r => setTimeout(r, 500));
      }
      resolve();
    };
    run();
  });
};


  // Process files button click
  const processFiles = async () => {
    if (selectedFiles.length === 0) return;

    setSection('processing');
    setProcessingFiles(selectedFiles);
    setProcessingStatus({});

    // Simulate processing sequentially
    for (let file of selectedFiles) {
      await simulateFileProcessing(file);
    }

    // Pick first file results based on filename matching sample data
    const firstFile = selectedFiles[0];
    let meetingData = sampleMeetings.meeting1;

    if (firstFile.name.toLowerCase().includes('standup')) {
      meetingData = sampleMeetings.meeting2;
    }

    setCurrentResults(meetingData);
    setSection('results');
  };

  // Display settings handlers
  const handleSettingChange = (e) => {
    const { name, type, value, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Helpers to format transcript based on settings
  const formatTranscript = (transcript) => {
    let t = transcript;
    if (!settings.includeTimestamps) {
      t = t.replace(/\[[\d:]+\]/g, '');
    }
    if (!settings.speakerIdentification) {
      t = t.replace(/^[A-Za-z]+:/gm, 'Speaker:');
    }
    return t;
  };

  // Export content generator (plain txt and markdown)
  const generateExportContent = (format) => {
    if (!currentResults) return '';
    const data = currentResults;
    if (format === 'markdown') {
      return `# Meeting Minutes

## Summary
${data.summary}

## Action Items
${data.actionItems.map(item => `- ${item}`).join('\n')}

## Decisions Made
${data.decisions.map(item => `- ${item}`).join('\n')}

## Participants
${data.participants.map(item => `- ${item}`).join('\n')}

## Full Transcript
\`\`\`
${data.transcript}
\`\`\`
`;
    } else {
      return `Meeting Minutes

Summary:
${data.summary}

Action Items:
${data.actionItems.map(item => `• ${item}`).join('\n')}

Decisions Made:
${data.decisions.map(item => `• ${item}`).join('\n')}

Participants:
${data.participants.map(item => `• ${item}`).join('\n')}

Full Transcript:
${data.transcript}
`;
    }
  };

  // Download helper
  const downloadFile = (content, filename, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export buttons click handler
  const handleExport = (format) => {
    if (!currentResults) return;
    let filename = 'meeting-minutes.txt';
    let content = generateExportContent('txt');
    let mimeType = 'text/plain';

    if (format === 'markdown') {
      filename = 'meeting-minutes.md';
      content = generateExportContent('markdown');
      mimeType = 'text/markdown';
    } else if (format === 'pdf' || format === 'docx') {
      alert('PDF and DOCX export needs implementation with proper libraries.');
      return;
    }

    downloadFile(content, filename, mimeType);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!currentResults) return;
    const content = generateExportContent('txt');
    navigator.clipboard.writeText(content).then(() => {
      alert('Meeting minutes copied to clipboard!');
    }, () => {
      alert('Failed to copy to clipboard');
    });
  };

  // Share via email
  const shareViaEmail = () => {
    if (!currentResults) return;
    const subject = encodeURIComponent('Meeting Minutes');
    const body = encodeURIComponent(generateExportContent('txt'));
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  // Demo data load
  const loadDemoData = (id) => {
    setCurrentResults(sampleMeetings[id]);
    setSection('results');
  };

  // Start over (reset)
  const startOver = () => {
    setSelectedFiles([]);
    setProcessingFiles([]);
    setCurrentResults(null);
    setProcessingStatus({});
    setSection('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Meeting Minutes Generator</h1>
        <p>Transform your meeting recordings into structured minutes</p>
      </header>

      <main>
        {/* Upload Section */}
        {section === 'upload' && (
          <section className="upload-section">
            <div
              className="upload-area"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              role="button"
              tabIndex={0}
              aria-label="Drag and drop audio files here or click to browse"
              style={{ border: '2px dashed #3B82F6', padding: '2rem', cursor: 'pointer' }}
            >
              <p>Drag & drop audio files here or click to browse</p>
              <small>Supported formats: .mp3, .wav, .mp4, .m4a, .flac (max 100MB each)</small>
              <input
                type="file"
                multiple
                accept=".mp3,.wav,.mp4,.m4a,.flac"
                ref={fileInputRef}
                onChange={onFileInputChange}
                style={{ display: 'none' }}
              />
            </div>
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <h3>Files to process</h3>
                {selectedFiles.map(f => (
                  <div key={f.id} className="file-item">
                    <span>{f.name} ({formatFileSize(f.size)})</span>
                    <button onClick={() => removeFile(f.id)} aria-label={`Remove file ${f.name}`}>Remove</button>
                  </div>
                ))}
                <button onClick={processFiles}>Process Files</button>
              </div>
            )}
            <div className="demo-buttons">
              <p>Or load demo data:</p>
              <button onClick={() => loadDemoData('meeting1')}>Load Project Planning Meeting</button>
              <button onClick={() => loadDemoData('meeting2')}>Load Team Standup Meeting</button>
            </div>
          </section>
        )}

        {/* Processing Section */}
        {section === 'processing' && (
          <section className="processing-section">
            <h3>Processing Files</h3>
            {processingFiles.map(file => {
              const statusInfo = processingStatus[file.id] || { status: 'Queued', progress: 0 };
              return (
                <div key={file.id} className="processing-file">
                  <span>{file.name}</span>
                  <span>{statusInfo.status}</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${statusInfo.progress}%`, backgroundColor: '#3B82F6', height: '10px' }}></div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Results Section */}
        {section === 'results' && currentResults && (
          <section className="results-section" style={{ display: 'flex', gap: '2rem' }}>
            <div className="transcript" style={{ flex: 1, overflowY: 'auto', maxHeight: '70vh', border: '1px solid #ccc', padding: '1rem' }}>
              <h3>Transcript</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{formatTranscript(currentResults.transcript)}</pre>
              <p>Word count: {formatTranscript(currentResults.transcript).split(/\s+/).filter(Boolean).length}</p>
            </div>
            <div className="meeting-minutes" style={{ flex: 1, overflowY: 'auto', maxHeight: '70vh', border: '1px solid #ccc', padding: '1rem' }}>
              <h3>Summary</h3>
              <p>{currentResults.summary}</p>
              <h4>Action Items</h4>
              <ul>{currentResults.actionItems.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
              <h4>Decisions Made</h4>
              <ul>{currentResults.decisions.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
              <h4>Participants</h4>
              <ul>{currentResults.participants.map((item, idx) => <li key={idx}>{item}</li>)}</ul>

              <div className="export-actions" style={{ marginTop: '2rem' }}>
                <button onClick={() => handleExport('txt')}>Download TXT</button>
                <button onClick={() => handleExport('markdown')}>Download Markdown</button>
                <button onClick={() => handleExport('pdf')}>Download PDF</button>
                <button onClick={() => handleExport('docx')}>Download DOCX</button>
                <button onClick={copyToClipboard}>Copy to Clipboard</button>
                <button onClick={shareViaEmail}>Share via Email</button>
                <button onClick={startOver}>Start Over</button>
              </div>
            </div>
          </section>
        )}

        {/* Settings Panel */}
        <aside className="settings-panel" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd' }}>
          <h3>Settings</h3>
          <fieldset>
            <legend>Summary Length</legend>
            {['Short', 'Medium', 'Detailed'].map(val => (
              <label key={val}>
                <input
                  type="radio"
                  name="summaryLength"
                  value={val}
                  checked={settings.summaryLength === val}
                  onChange={handleSettingChange}
                />
                {val}
              </label>
            ))}
          </fieldset>
          <label>
            <input
              type="checkbox"
              name="includeTimestamps"
              checked={settings.includeTimestamps}
              onChange={handleSettingChange}
            />
            Include Timestamps
          </label>
          <label>
            <input
              type="checkbox"
              name="speakerIdentification"
              checked={settings.speakerIdentification}
              onChange={handleSettingChange}
            />
            Speaker Identification
          </label>
          <label>
            Language:
            <select name="language" value={settings.language} onChange={handleSettingChange}>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Italian</option>
              <option>Portuguese</option>
            </select>
          </label>
        </aside>
      </main>
    </div>
  );
}
