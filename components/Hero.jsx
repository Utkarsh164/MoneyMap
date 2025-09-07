"use client";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

const HeroSection = () => {
  const imageRef = useRef();
  useEffect(() => {
    const imageElement = imageRef.current;
    const handleScroll = () => {
      const scrolledPosition = window.scrollY;
      const scrolledThreshold = 100;
      if (scrolledPosition > scrolledThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll",handleScroll)
    return ()=>window.removeEventListener("scroll",handleScroll)
  }, []);

  return (
    <div className="pb-20 px-4">
      <div className="mx-auto container text-center">
        <h1 className="text-5xl md:text-8xl gradient-title lg:text-[105px] pb-6 font-bold">
          Manage Your Finance <br /> With Intelligence
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          An intelligent finance assistant that helps you track spending, set
          budgets, automate savings, and make smarter financial decisions.
        </p>
        <div className="flex justify-center gap-4">
          <Link href={"/dashboard"}>
            <Button className={"px-8"} size={"lg"}>
              Get Started
            </Button>
          </Link>
          <Link
            href={
              "https://github.com/Utkarsh164/MoneyMap.git"
            }
          >
            <Button className={"px-8"} variant={"outline"} size={"lg"}>
              Learn More
            </Button>
          </Link>
        </div>
      </div>
      <div className="hero-image-wrapper">
        <div ref={imageRef} className="hero-image">
          <Image
            src="/banner.jpg"
            alt="Banner"
            priority
            className="mx-auto rounded-lg  border shadow-2xl"
            width={1280}
            height={720}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
