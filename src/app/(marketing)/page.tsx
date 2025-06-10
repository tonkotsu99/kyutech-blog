"use client"; // クライアントコンポーネントとして指定

import { Card, CardContent } from "@/components/ui/card";
import { marketingConfig } from "@/config/marketing";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { useEffect, useState } from "react"; // アニメーションのためにuseStateとuseEffectをインポート
import { Instagram } from "lucide-react"; // Instagramアイコンを追加

const IndexPage = () => {
  // ヒーローセクションの要素がフェードインするための状態管理
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true); // コンポーネントがマウントされたら表示
  }, []);

  return (
    <>
      {/* ヒーローセクション */}
      <section className="relative pt-6 md:pt-10 lg:py-32 pb-8 md:pb-12 overflow-hidden min-h-[calc(100vh-64px)] flex items-center">
        {" "}
        {/* min-hで最低高さを確保し中央寄せ */}
        {/* 背景のグラデーションアニメーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-70 -z-10 animate-gradient-shift"></div>
        <div className="container text-center flex flex-col items-center gap-6 max-w-4xl relative z-10 py-16 md:py-24">
          {" "}
          {/* コンテンツのパディング */}
          <h1
            className={`font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800 drop-shadow-lg transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            LocaLabo
          </h1>
          <p
            className={`text-gray-700 sm:text-xl leading-normal max-w-2xl transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            このアプリケーションは芹川・張・山脇・楊研究室の在室管理システムです。
            ユーザーは在室と退室を記録することができます。
            <span className="font-semibold text-blue-600">
              ※B4は特に重要!!!
            </span>
            <br />
            Notionライクなテキストエディターを構築しており、週報や研究、就活ハウツーなど何でも書いてください!!!
          </p>
          <Link
            href="/mobile/attendance"
            className={`mt-8 px-10 py-4 bg-blue-600 text-white font-bold text-xl rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            } delay-400`}
          >
            在室を記録する
          </Link>
        </div>
      </section>

      {/* サービスの特徴セクション */}
      <section
        id="features"
        className="container py-12 md:py-20 lg:py-32 bg-gray-50 space-y-10 rounded-lg shadow-inner my-12" // 背景色と影を追加
      >
        <div className="text-center space-y-6">
          <h2 className="font-extrabold text-4xl md:text-6xl mx-auto text-gray-800 leading-tight">
            LocaLaboが提供する
            <br className="sm:hidden" />
            素晴らしい特徴
          </h2>
          <p className="max-w-4xl mx-auto text-gray-600 sm:text-lg sm:leading-7">
            このプロジェクトはモダンな技術スタックを使って作られたWebアプリケーションです。Next.jsのApp
            RouterやEditor.jsを利用してNotionのような書き心地でブログ投稿ができます。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {marketingConfig.techstack.map((item, index) => (
            <Card
              key={index}
              className="transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 border-gray-100 hover:border-blue-400 rounded-lg overflow-hidden"
            >
              <CardContent className="p-6">
                <Link href={item.href} className="block group">
                  {" "}
                  {/* グループホバーエフェクト用 */}
                  <div className="flex h-full items-center space-x-4">
                    <div className="text-blue-500 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                      {item.svg} {/* item.svgはSVGコンポーネントを想定 */}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-lg font-semibold leading-none text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* お問い合わせセクション */}
      <section id="contact" className="container py-12 md:py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center flex flex-col gap-6">
          <h2 className="font-extrabold text-4xl md:text-6xl text-gray-800">
            お問い合わせ
          </h2>
          <p className="text-gray-600 sm:text-lg sm:leading-7 max-w-3xl mx-auto">
            LocaLaboにご興味をお持ちいただけたなら、ぜひご連絡ください。
            <br />
            お仕事のご依頼やご質問など、心よりお待ちしております。
          </p>
          <Link
            href={siteConfig.links.instagram}
            className="inline-flex items-center justify-center px-8 py-4 bg-pink-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-pink-700 transition-all duration-300 transform hover:scale-105 group"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram className="h-7 w-7 mr-3 transition-transform duration-300 group-hover:rotate-6" />{" "}
            {/* Instagramアイコン */}
            Instagramで連絡する
          </Link>
        </div>
      </section>
    </>
  );
};

export default IndexPage;
