'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getBlogPostBySlug } from '@/data/blogPosts';
import ReactMarkdown from 'react-markdown';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-montserrat text-4xl font-bold text-white mb-4">
            Artigo Não Encontrado
          </h1>
          <Link href="/blog">
            <button className="bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-6 py-3 rounded-lg font-open-sans font-semibold transition-all">
              Voltar ao Blog
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog">
            <button className="text-[#00FF8C] hover:text-[#00DD7A] font-open-sans font-semibold transition-colors inline-flex items-center gap-2 mb-8">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao Blog
            </button>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <span className="inline-block bg-[#00FF8C]/20 text-[#00FF8C] px-3 py-1 rounded-full font-montserrat text-xs font-bold">
              {post.category}
            </span>
            <span className="font-open-sans text-sm text-[#9E9E9E]">
              {new Date(post.date).toLocaleDateString('pt-BR')} • {post.readTime} de leitura
            </span>
          </div>

          <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-white mb-4">
            {post.title}
          </h1>

          <p className="font-open-sans text-lg text-[#E0E0E0] mb-4">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 text-[#9E9E9E]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-open-sans text-sm">{post.author}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-montserrat prose-headings:text-white prose-headings:font-bold
              prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-10
              prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-10 prose-h2:text-[#00FF8C]
              prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
              prose-p:font-open-sans prose-p:text-[#E0E0E0] prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
              prose-strong:text-white prose-strong:font-semibold
              prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:space-y-2
              prose-li:font-open-sans prose-li:text-[#E0E0E0] prose-li:text-lg prose-li:leading-relaxed
              prose-a:text-[#00FF8C] prose-a:no-underline hover:prose-a:text-[#00DD7A] prose-a:transition-colors
              prose-code:text-[#00FF8C] prose-code:bg-[#1a1a1a] prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base
              prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-[#4C5FD5]/30 prose-pre:rounded-lg
              prose-table:border-collapse prose-table:w-full prose-table:my-8
              prose-th:border prose-th:border-[#4C5FD5]/30 prose-th:bg-[#1a1a1a] prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-montserrat prose-th:text-white prose-th:font-semibold
              prose-td:border prose-td:border-[#4C5FD5]/30 prose-td:px-4 prose-td:py-3 prose-td:font-open-sans prose-td:text-[#E0E0E0]
              prose-blockquote:border-l-4 prose-blockquote:border-[#00FF8C] prose-blockquote:pl-6 prose-blockquote:py-1 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-[#9E9E9E]
              prose-hr:border-[#4C5FD5]/30 prose-hr:my-8
            "
          >
            <ReactMarkdown
              components={{
                h2: ({node, ...props}) => <h2 className="border-b border-[#4C5FD5]/20 pb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-[#00FF8C]/90" {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Call to Action */}
          <div className="mt-16 p-8 rounded-2xl border border-[#4C5FD5]/30 text-center" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
            <h3 className="font-montserrat text-2xl font-bold text-white mb-4">
              Gostou deste artigo?
            </h3>
            <p className="font-open-sans text-[#E0E0E0] mb-6">
              Experimente o Hand Replayer gratuitamente e comece a melhorar seu jogo hoje.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register">
                <button className="bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-8 py-3 rounded-lg font-open-sans font-semibold transition-all shadow-lg hover:shadow-[#00FF8C]/50">
                  Começar Grátis
                </button>
              </Link>
              <Link href="/blog">
                <button className="border-2 border-[#00FF8C] text-[#00FF8C] hover:bg-[#00FF8C]/10 px-8 py-3 rounded-lg font-open-sans font-semibold transition-all">
                  Ler Mais Artigos
                </button>
              </Link>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="font-open-sans text-[#9E9E9E]">Compartilhe:</span>
            <button className="p-2 bg-[#1a1a1a] hover:bg-[#00FF8C]/20 rounded-lg transition-all">
              <svg className="w-5 h-5 text-[#00FF8C]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </button>
            <button className="p-2 bg-[#1a1a1a] hover:bg-[#00FF8C]/20 rounded-lg transition-all">
              <svg className="w-5 h-5 text-[#00FF8C]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </button>
            <button className="p-2 bg-[#1a1a1a] hover:bg-[#00FF8C]/20 rounded-lg transition-all">
              <svg className="w-5 h-5 text-[#00FF8C]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </button>
          </div>
        </div>
      </article>

      {/* Back to Home */}
      <div className="py-8 px-4 text-center border-t border-[#4C5FD5]/20">
        <Link
          href="/"
          className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
