import { useState, useRef, useEffect } from 'react';
import { useApp, Message, MessageAttachment } from '../context/AppContext';
import { Send, Paperclip, Inbox, Clock, X, Save, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

export default function Messaging() {
  const { currentUser, sendMessage, messages, markMessageAsRead, users, barangays, saveDraft, drafts, deleteDraft } = useApp();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'mymessages'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // Compose form
  const [composeForm, setComposeForm] = useState({
    subject: '',
    content: '',
    type: 'feedback' as 'request' | 'feedback' | 'broadcast',
    recipientId: '',
    recipientBarangay: '',
  });
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const recipientOptions = users.filter(u => u.id !== currentUser.id);

  // Load draft from URL parameter
  useEffect(() => {
    const draftId = searchParams.get('draft');
    if (draftId) {
      const draft = drafts.find(d => d.id === draftId && d.type === 'message');
      if (draft) {
        setComposeForm({
          subject: draft.data.subject || '',
          content: draft.data.content || '',
          type: draft.data.type || 'feedback',
          recipientId: draft.data.recipientId || '',
          recipientBarangay: draft.data.recipientBarangay || '',
        });
        if (draft.data.attachments) {
          setAttachments(draft.data.attachments);
        }
        setActiveTab('compose');
      }
    }
  }, [searchParams, drafts]);

  // Get inbox messages - messages received by current user
  const inboxMessages = messages.filter(m => {
    if (currentUser.role === 'admin') {
      // Admin sees all messages sent to them or their barangay
      return m.recipientId === currentUser.id || m.recipientBarangay === currentUser.assignedBarangay;
    } else {
      // Users only see messages from admin or to themselves
      return m.recipientId === currentUser.id || (m.type === 'broadcast' && m.recipientBarangay === currentUser.assignedBarangay);
    }
  });

  // Get sent messages - messages sent by current user
  const sentMessages = messages.filter(m => m.senderId === currentUser.id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const attachment: MessageAttachment = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type.startsWith('image') ? 'photo' : file.type.startsWith('video') ? 'video' : 'file',
            dataUrl,
            size: file.size,
          };
          setAttachments([...attachments, attachment]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveMessageDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.subject.trim() || !composeForm.content.trim()) {
      alert('Please fill in subject and message content');
      return;
    }

    saveDraft('message', {
      ...composeForm,
      attachments,
    });
    alert('Message draft saved successfully!');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.subject.trim() || !composeForm.content.trim()) {
      alert('Please fill in subject and message content');
      return;
    }

    if (currentUser.role === 'user' && !composeForm.recipientId) {
      alert('Please select a recipient');
      return;
    }

    if (currentUser.role === 'admin' && composeForm.type === 'broadcast' && !composeForm.recipientBarangay) {
      alert('Please select a barangay');
      return;
    }

    const message: Omit<Message, 'id' | 'createdAt'> = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      subject: composeForm.subject,
      content: composeForm.content,
      type: composeForm.type,
      attachments,
      isRead: false,
      recipientId: composeForm.recipientId || undefined,
      recipientBarangay: composeForm.recipientBarangay || undefined,
    };

    sendMessage(message);

    const messageDraft = drafts.find(d => d.type === 'message');
    if (messageDraft) deleteDraft(messageDraft.id);

    // Reset form
    setComposeForm({
      subject: '',
      content: '',
      type: 'feedback',
      recipientId: '',
      recipientBarangay: '',
    });
    setAttachments([]);
    setActiveTab('inbox');
  };

  const renderMessageDetail = (message: Message) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{message.subject}</h2>
            <p className="text-sm text-gray-600 mt-1">From: <strong>{message.senderName}</strong></p>
          </div>
          <button
            onClick={() => {
              setSelectedMessage(null);
              markMessageAsRead(message.id);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
            {message.type}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
          {message.content}
        </div>

        {message.attachments.length > 0 && (
          <div className="border-t pt-4">
            <p className="font-medium text-gray-900 mb-3">Attachments</p>
            <div className="space-y-2">
              {message.attachments.map(att => (
                <a
                  key={att.id}
                  href={att.dataUrl}
                  download={att.name}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-indigo-600 hover:underline">{att.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {(att.size / 1024).toFixed(2)} KB
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMessageList = (messageList: Message[]) => (
    <div className="space-y-3">
      {messageList.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
          No messages yet.
        </div>
      ) : selectedMessage ? (
        renderMessageDetail(selectedMessage)
      ) : (
        messageList.map(msg => (
          <div
            key={msg.id}
            onClick={() => {
              setSelectedMessage(msg);
              markMessageAsRead(msg.id);
            }}
            className={`p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all ${
              msg.isRead
                ? 'bg-white border-gray-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-medium ${msg.isRead ? 'text-gray-900' : 'text-gray-900 font-bold'}`}>
                    {msg.subject}
                  </h3>
                  {!msg.isRead && (
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  From: <strong>{msg.senderName}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{msg.content}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-xs text-gray-500">
                  {format(new Date(msg.createdAt), 'MMM d')}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded capitalize bg-gray-100 text-gray-700">
                  {msg.type}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Messages</h1>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('inbox');
            setSelectedMessage(null);
          }}
          className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'inbox'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Inbox className="inline w-5 h-5 mr-2" />
          Inbox ({inboxMessages.filter(m => !m.isRead).length})
        </button>
        <button
          onClick={() => {
            setActiveTab('compose');
            setSelectedMessage(null);
          }}
          className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'compose'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Send className="inline w-5 h-5 mr-2" />
          New Message
        </button>
        <button
          onClick={() => {
            setActiveTab('mymessages');
            setSelectedMessage(null);
          }}
          className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'mymessages'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail className="inline w-5 h-5 mr-2" />
          My Messages ({sentMessages.length})
        </button>
      </div>

      {activeTab === 'inbox' && renderMessageList(inboxMessages)}

      {activeTab === 'mymessages' && renderMessageList(sentMessages)}

      {activeTab === 'compose' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSendMessage} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={composeForm.subject}
                onChange={e => setComposeForm({ ...composeForm, subject: e.target.value })}
                placeholder="Message subject..."
              />
            </div>

            {currentUser.role === 'admin' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={composeForm.type}
                    onChange={e => setComposeForm({ ...composeForm, type: e.target.value as 'request' | 'feedback' | 'broadcast' })}
                  >
                    <option value="broadcast">Broadcast to Barangay</option>
                    <option value="feedback">Direct Message</option>
                  </select>
                </div>

                {composeForm.type === 'broadcast' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Barangay</label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={composeForm.recipientBarangay}
                      onChange={e => setComposeForm({ ...composeForm, recipientBarangay: e.target.value })}
                    >
                      <option value="">Choose barangay...</option>
                      {barangays.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={composeForm.recipientId}
                      onChange={e => setComposeForm({ ...composeForm, recipientId: e.target.value })}
                    >
                      <option value="">Choose user...</option>
                      {recipientOptions.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {currentUser.role === 'user' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={composeForm.type}
                    onChange={e => setComposeForm({ ...composeForm, type: e.target.value as 'request' | 'feedback' | 'broadcast' })}
                  >
                    <option value="feedback">Feedback</option>
                    <option value="request">Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Recipient</label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={composeForm.recipientId}
                    onChange={e => setComposeForm({ ...composeForm, recipientId: e.target.value })}
                  >
                    <option value="">Choose recipient...</option>
                    {recipientOptions.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                required
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={composeForm.content}
                onChange={e => setComposeForm({ ...composeForm, content: e.target.value })}
                placeholder="Type your message here..."
              />
            </div>

            {attachments.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Attachments</p>
                <div className="space-y-2">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter(a => a.id !== att.id))}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.avi"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Attach Files
              </button>
              <button
                type="button"
                onClick={handleSaveMessageDraft}
                className="inline-flex items-center px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
