import {
  Component,
  signal,
  effect,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { ChatHistoryItem, ChatService } from './chat.service';

// Type definitions
export type MessageItem = {
  content: string;
  sender: 'me' | 'model';
  timestamp?: Date;
  contentAsHtml?: SafeHtml;
};

type SuggestionItem = {
  title: string;
  icon: string;
};

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('messageEnd') messageEndRef!: ElementRef<HTMLDivElement>;
  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  private chatService = inject(ChatService);
  private sanitizer = inject(DomSanitizer);

  // Signals for state management
  isOpen = signal(false);
  isLoading = signal(false);
  inputValue = signal('');
  messages = signal<MessageItem[]>([]);

  suggestions: SuggestionItem[] = [
    {
      title: 'Thời gian trao đổi pin cao điểm nhất gần đây là khi nào?',
      icon: '🇻🇳',
    },
    {
      title: 'Trạm pin nào gần đây đang có dấu hiệu quá tải?',
      icon: '🌿',
    },
    { title: 'Tình hình doanh thu của công ty mấy tháng gần đây như thế nào?', icon: '🤝' },
    // { title: '', icon: '🏛️' },
  ];

  showSuggestions = computed(
    () => this.messages().length === 1 && this.messages()[0].sender === 'model'
  );

  private wheelListener = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = this.messagesContainerRef.nativeElement;
    if (!el) return;
    el.scrollTop += e.deltaY;
  };

  constructor() {
    const initialMessage = this.processMessage({
      content:
        'Xin chào! 👋 Mình là trợ lý ảo EV bot, chuyên hỗ trợ về mảng quản lý doanh thu và giao dịch đổi trả pin.',
      sender: 'model',
      timestamp: new Date(),
    });
    this.messages.set([initialMessage]);

    // Auto-scroll effect
    effect(() => {
      // These subscriptions trigger the effect when new messages are added or loading state changes.
      this.messages();
      this.isLoading();

      // We use a timeout to ensure the DOM has been updated with the new message before we try to scroll.
      setTimeout(() => {
        this.messageEndRef?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    });
  }

  ngAfterViewInit() {
    // Custom wheel handling to prevent issues with page-level smooth scrolling libraries
    const el = this.messagesContainerRef.nativeElement;
    el.addEventListener('wheel', this.wheelListener, { passive: false });
    el.addEventListener('wheelCapture', (e) => e.stopPropagation());
    el.addEventListener('touchmove', (e) => e.stopPropagation());
  }

  ngOnDestroy() {
    const el = this.messagesContainerRef?.nativeElement;
    if (el) {
      el.removeEventListener('wheel', this.wheelListener);
    }
  }

  // ==== Message Handling ====
  handleSendMessage(text: string): void {
    const content = text.trim();
    if (content === '') return;

    const meMsg = this.processMessage({
      content: content,
      sender: 'me',
      timestamp: new Date(),
    });
    this.inputValue.set('');
    this.messages.update((prev) => [...prev, meMsg]);
    this.isLoading.set(true);
    this.adjustTextareaHeight();

    const currentMessages = this.messages();
    const historyToSend = currentMessages
      .slice(-20) // Cap at 20
      .map(
        (msg): ChatHistoryItem => ({
          role: msg.sender === 'me' ? 'user' : 'model',
          text: msg.content,
        })
      );

    this.chatService.getAnswer(historyToSend).subscribe({
      next: (answer) => {
        const botMsg = this.processMessage({
          content: answer || 'Xin lỗi, mình chưa có câu trả lời phù hợp.',
          sender: 'model',
          timestamp: new Date(),
        });
        this.messages.update((prev) => [...prev, botMsg]);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        const errorMsg = this.processMessage({
          content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
          sender: 'model',
          timestamp: new Date(),
        });
        this.messages.update((prev) => [...prev, errorMsg]);
        this.isLoading.set(false);
      },
    });
  }

  handleSuggestionClick(suggestion: string): void {
    this.handleSendMessage(suggestion);
  }

  private processMessage(message: MessageItem): MessageItem {
    const parsedContent = marked(message.content);
    const safeHtml = this.sanitizer.bypassSecurityTrustHtml(parsedContent as string);
    return { ...message, contentAsHtml: safeHtml };
  }

  // ==== UI Helpers ====
  toggleChat(open: boolean): void {
    this.isOpen.set(open);
  }

  openFullScreenChat(): void {
    window.open(`${window.location.origin}/chat`, '_blank', 'noopener,noreferrer');
  }

  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSendMessage(this.inputValue());
    }
  }

  adjustTextareaHeight(): void {
    const textarea = this.textareaRef.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
